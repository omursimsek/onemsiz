using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Backend.Application.Interfaces;
using Moq;
using Backend.Infrastructure.Files;

namespace Backend.Tests.Utils;

public static class FileStorageStub
{
    public static IFileStorage Create()
    {
        var stub = new Moq.Mock<IFileStorage>();
        stub.Setup(f => f.SaveAsync(It.IsAny<string>(), It.IsAny<Stream>(), true, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        return stub.Object;
    }
}
