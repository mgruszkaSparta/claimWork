using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AutomotiveClaimsApi.Tests;

public class RootEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public RootEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetApiRoot_ReturnsOk()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
