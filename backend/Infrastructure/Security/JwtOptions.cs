namespace Backend.Infrastructure.Security;

public class JwtOptions
{
    public string Issuer { get; set; } = "B2BApp";
    public string Audience { get; set; } = "B2BAppUsers";
    public string Key { get; set; } = "change_this_dev_secret_to_a_long_random_value";
    public int ExpireMinutes { get; set; } = 480;
}
