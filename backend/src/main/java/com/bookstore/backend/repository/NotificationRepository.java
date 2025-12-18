package com.bookstore.backend.repository;

import com.bookstore.backend.model.Notification;
import com.bookstore.backend.repository.projection.NotificationView;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query(
            value = """
        SELECT *
        FROM (
            SELECT n.id AS id,
                n.content AS content,
                n.url AS url,
                n.create_at AS createAt,
                NULL AS isRead
            FROM notification n
            WHERE n.type = 'BROADCAST'

            UNION ALL
            SELECT
                n.id AS id,
                n.content AS content,
                n.url AS url,
                n.create_at AS createAt,
                un.is_read AS isRead
            FROM notification n
            JOIN user_notification un
                ON un.notification_id = n.id
            WHERE n.type = 'PERSONAL'
              AND un.user_id = :userId
        ) t
        ORDER BY createAt DESC
        """,
            countQuery = """
        SELECT COUNT(*)
        FROM (
            SELECT n.id
            FROM notification n
            WHERE n.type = 'BROADCAST'
            UNION ALL
            SELECT n.id
            FROM notification n
            JOIN user_notification un
                ON un.notification_id = n.id
            WHERE n.type = 'PERSONAL'
              AND un.user_id = :userId
        ) c
        """,
            nativeQuery = true
    )
    Page<NotificationView> findAllNotifications(@Param("userId") Long userId, Pageable pageable);


}
