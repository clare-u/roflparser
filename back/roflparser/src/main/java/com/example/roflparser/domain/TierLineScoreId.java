package com.example.roflparser.domain;

import com.example.roflparser.domain.type.Position;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class TierLineScoreId implements Serializable {
    private String tierName;
    private Integer tierOrder;

    @Enumerated(EnumType.STRING)
    private Position position;
}
