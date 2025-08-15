using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;

namespace Backend.Tests.Utils;

public static class TestDbFactory
{
    public static AppDbContext CreateInMemory(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;
        /*
        var conn = new SqliteConnection("Filename=:memory:");
        conn.Open();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(conn)
            .Options;
        var db = new AppDbContext(options, new HttpContextAccessor());
        db.Database.EnsureCreated();
        */
        
        // IHttpContextAccessor testlerde gerekmiyorsa null geçilebilir;
        // ctor’da zorunlu ise sahte bir accessor verin.
        var http = new HttpContextAccessor();
        return new AppDbContext(options, http);
    }
}
