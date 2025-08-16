namespace Backend.Application.Services.LocationImporting;

public record ImportResult(int RowsRead, int LocationsInserted, int IdentifiersInserted, int LocationsUpdated);
