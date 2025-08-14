// /src/Backend/Domain/ValueObjects/TenantPath.cs
using System.Text;
using System.Text.RegularExpressions;

namespace Backend.Domain.ValueObjects;

public static class TenantPath
{
    // Basit slugify (yalnızca a-z0-9): mevcut davranışa birebir uyum
    public static string Slugify(string input) =>
        Regex.Replace(input.ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');

    public static string BuildPath(string? parentPath, string slug) =>
        string.IsNullOrEmpty(parentPath) ? slug : $"{parentPath}.{slug}";
}
