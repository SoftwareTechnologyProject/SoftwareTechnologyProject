package com.bookstore.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class S3Config {

    @Value("${aws.s3.access-key}")
    private String accessKey;

    @Value("${aws.s3.secret-key}")
    private String secretKey;

    @Value("${aws.s3.region}")
    private String region;

    @Bean
    public S3Client s3Client() {
        System.out.println("🔧 S3Config - Initializing S3 Client");
        System.out.println("   Access Key: " + accessKey);
        System.out.println("   Region: " + region);
        System.out.println("   Default Bucket: " + (System.getenv("AWS_S3_BUCKET_NAME") != null ? System.getenv("AWS_S3_BUCKET_NAME") : "not set"));
        System.out.println("   Blog Bucket: " + (System.getenv("AWS_S3_BLOG_BUCKET_NAME") != null ? System.getenv("AWS_S3_BLOG_BUCKET_NAME") : "not set"));
        
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKey, secretKey);
        
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .build();
    }
}
