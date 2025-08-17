namespace Backend.Application.DTOs.Locations;

public record LocationSearchResult(
    IReadOnlyList<LocationDto> Locations,
    int TotalCount,
    int TotalPages,
    int CurrentPage,
    int Take,
    bool HasNextPage,
    bool HasPrevPage
);
