using System.Text.RegularExpressions;

namespace Backend.Services;

public static class TenantPathHelper
{
    public static string Slugify(string input)
        => Regex.Replace(input.ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');

    public static string BuildPath(string? parentPath, string slug)
        => string.IsNullOrEmpty(parentPath) ? slug : $"{parentPath}.{slug}";
}
