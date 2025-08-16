namespace Backend.Domain.Enums;

public enum LocationKind
{
    Station = 0,      // Demiryolu istasyonu / terminal
    Port = 1,         // Deniz limanı
    Depot = 2,        // Depo/terminal
    Address = 3,      // Serbest adres (opsiyonel)
    Node = 4          // Genel düğüm
}
