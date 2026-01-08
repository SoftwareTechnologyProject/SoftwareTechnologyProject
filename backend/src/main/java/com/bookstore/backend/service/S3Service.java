package com.bookstore.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.blog-bucket-name}")
    private String blogBucketName;

    @Value("${aws.s3.region}")
    private String region;

    /**
     * Upload file to S3 and return public URL (for blog images)
     */
    public String uploadFile(MultipartFile file) throws IOException {
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : "";
        String fileName = "blog/" + UUID.randomUUID().toString() + extension;

        // Upload to S3 - use blogBucketName for blog images
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(blogBucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Return public URL
        return String.format("https://%s.s3.%s.amazonaws.com/%s", blogBucketName, region, fileName);
    }

    /**
     * Upload book image to S3 and return public URL
     */
    public String uploadBookImage(MultipartFile file) throws IOException {
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : "";
        String fileName = "books/" + UUID.randomUUID().toString() + extension;

        // Upload to S3 - use bucketName for book images
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        // Return public URL
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
    }

    /**
     * Delete file from S3 by URL
     */
    public void deleteFileByUrl(String fileUrl) {
        try {
            // Extract key from URL
            // Format: https://bucket-name.s3.region.amazonaws.com/key
            String key = fileUrl.substring(fileUrl.indexOf(".com/") + 5);
            
            // Determine which bucket based on URL
            String targetBucket = fileUrl.contains(blogBucketName) ? blogBucketName : bucketName;
            
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(targetBucket)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
        } catch (Exception e) {
            // Log error but don't throw exception
            System.err.println("Error deleting file from S3: " + e.getMessage());
        }
    }
}
