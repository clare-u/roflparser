package com.example.roflparser.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class PaginatedMatchDetailResponse {
    private int totalItems;
    private int currentPage;
    private int pageSize;
    private List<MatchDetailResponse> items;
}
