namespace Backend.Infrastructure.Files;

public interface IFileStorage
{
    Task SaveAsync(string relativePath, Stream stream, bool overwrite, CancellationToken ct);
}
