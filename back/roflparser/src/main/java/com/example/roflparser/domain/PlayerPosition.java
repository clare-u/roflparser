package com.example.roflparser.domain;

import com.example.roflparser.domain.type.Position;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "player_positions")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PlayerPosition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // ✅ 명확한 PK 존재

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @Enumerated(EnumType.STRING)
    @Column(name = "position", nullable = false, length = 20)
    private Position position;

    @Column(name = "tier_name", nullable = false, length = 50)
    private String tierName;

    @Column(name = "tier_order", nullable = false)
    private Integer tierOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(name = "tier_name", referencedColumnName = "tier_name", insertable = false, updatable = false),
            @JoinColumn(name = "tier_order", referencedColumnName = "tier_order", insertable = false, updatable = false),
            @JoinColumn(name = "position", referencedColumnName = "position", insertable = false, updatable = false)
    })
    private TierLineScore tierLineScore;


    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
