package com.example.roflparser.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Where;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "matches")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Builder(toBuilder = true)
@AllArgsConstructor
@Where(clause = "deleted = false")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "match_id", length = 100, nullable = false, unique = true)
    private String matchId;

    @Column(name = "game_datetime")
    private LocalDateTime gameDatetime;

    @Column(name = "game_length")
    private Long gameLength; // Integer -> Long 변경

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clan_id")
    private Clan clan;

    @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MatchParticipant> participants = new ArrayList<>();

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