namespace Backend.Domain.Enums;

public enum DangerousGoodsScheme
{
    UN = 1,        // United Nations Number
    IATA = 2,      // IATA Dangerous Goods Regulations
    IMDG = 3,      // International Maritime Dangerous Goods
    ADR = 4,       // European Agreement concerning the International Carriage of Dangerous Goods by Road
    RID = 5,       // Regulations concerning the International Carriage of Dangerous Goods by Rail
    ICAO = 6,      // International Civil Aviation Organization
    Custom = 7     // Custom scheme
}
