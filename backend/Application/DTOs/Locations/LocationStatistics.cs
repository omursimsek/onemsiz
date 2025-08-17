namespace Backend.Application.DTOs.Locations;

public record LocationStatistics(
    int TotalLocations,
    int UniqueCountries,
    int TotalIdentifiers,
    int ThisMonthLocations
);

public record CountryStatistics(
    string CountryCode,
    int LocationCount,
    int IdentifierCount
);

public record SchemeStatistics(
    string Scheme,
    int IdentifierCount
);
