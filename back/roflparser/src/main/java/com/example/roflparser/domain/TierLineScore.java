package com.example.roflparser.domain;

import com.example.roflparser.domain.type.Position;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "tier_line_scores")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TierLineScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // PK 추가

    @Column(name = "tier_name", nullable = false, length = 50)
    private String tierName;

    @Column(name = "tier_order", nullable = false)
    private Integer tierOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "position", nullable = false, length = 20)
    private Position position;

    @Column(nullable = false)
    private Double score;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private boolean deleted = false;
}
