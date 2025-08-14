using Microsoft.AspNetCore.Hosting;

namespace Backend.Infrastructure.Files;

public class LocalFileStorage : IFileStorage
{
    private readonly IWebHostEnvironment _env;

    public LocalFileStorage(IWebHostEnvironment env) => _env = env;

    public async Task SaveAsync(string relativePath, Stream stream, bool overwrite, CancellationToken ct)
    {
        // wwwroot + relativePath
        var webRoot = Path.Combine(_env.ContentRootPath, "wwwroot");
        var fullPath = Path.Combine(webRoot, relativePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        if (!overwrite && File.Exists(fullPath))
            throw new IOException("File already exists.");

        using var fs = File.Create(fullPath);
        await stream.CopyToAsync(fs, ct);
    }
}
