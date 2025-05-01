package com.example.roflparser.domain;

import com.example.roflparser.domain.type.Position;
import jakarta.persistence.*;
        import lombok.*;
        import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Entity
@Table(name = "match_participants")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MatchParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @Column(name = "champion", length = 50)
    private String champion;

    @Column(name = "team", length = 10)
    private String team;

    @Enumerated(EnumType.STRING)
    @Column(name = "position", length = 20)
    private Position position;

    @Column(name = "win")
    private Boolean win;

    @Column(name = "CHAMPIONS_KILLED")
    private Integer championsKilled;

    @Column(name = "ASSISTS")
    private Integer assists;

    @Column(name = "NUM_DEATHS")
    private Integer numDeaths;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private boolean deleted = false;

    public void delete() {
        this.deleted = true;
    }

    public void restore() {
        this.deleted = false;
    }
}
