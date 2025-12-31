package com.bookstore.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public GeminiService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Check if comment content is appropriate using Gemini AI
     * @param comment The comment text to check
     * @return true if appropriate, false if contains toxic/negative content
     */
    public boolean isCommentAppropriate(String comment) {
        try {
            System.out.println("🤖 Checking comment with Gemini AI: " + comment);

            // Build prompt for Gemini
            String prompt = String.format(
                "Phân tích bình luận sau và cho biết có phù hợp không. " +
                "Trả lời ĐÚNG nếu bình luận lịch sự, tích cực hoặc trung lập. " +
                "Trả lời SAI nếu bình luận có nội dung tục tĩu, tiêu cực, xúc phạm, hoặc không phù hợp.\n\n" +
                "Bình luận: \"%s\"\n\n" +
                "Chỉ trả lời một từ: ĐÚNG hoặc SAI", 
                comment
            );

            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, String> part = new HashMap<>();
            part.put("text", prompt);
            content.put("parts", List.of(part));
            requestBody.put("contents", List.of(content));

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Make request to Gemini API
            String url = apiUrl + "?key=" + apiKey;
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            // Parse response
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> contentResponse = (Map<String, Object>) candidate.get("content");
                    @SuppressWarnings("unchecked")
                    List<Map<String, String>> parts = (List<Map<String, String>>) contentResponse.get("parts");
                    
                    if (parts != null && !parts.isEmpty()) {
                        String text = parts.get(0).get("text").trim().toLowerCase();
                        System.out.println("✅ Gemini response: " + text);
                        
                        // Check if response contains "đúng" (appropriate)
                        boolean isAppropriate = text.contains("đúng");
                        System.out.println(isAppropriate ? "✅ Comment is appropriate" : "❌ Comment is inappropriate");
                        return isAppropriate;
                    }
                }
            }

            System.err.println("⚠️ Could not get valid response from Gemini, allowing comment by default");
            return true; // Default to allowing if API fails

        } catch (Exception e) {
            System.err.println("❌ Error calling Gemini API: " + e.getMessage());
            e.printStackTrace();
            return true; // Default to allowing if error occurs
        }
    }
}
