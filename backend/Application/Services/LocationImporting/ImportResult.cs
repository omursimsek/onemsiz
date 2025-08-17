namespace Backend.Application.Services.LocationImporting;

public record ImportResult(
    int RowsRead, 
    int LocationsInserted, 
    int IdentifiersInserted, 
    int LocationsUpdated, 
    int Skipped = 0,
    // Dangerous Goods için yeni field'lar
    int DangerousGoodsInserted = 0,
    int DangerousGoodsUpdated = 0
);
