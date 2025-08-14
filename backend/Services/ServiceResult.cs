namespace AutomotiveClaimsApi.Services
{
    /// <summary>
    /// Generic wrapper used by services to return operation results
    /// together with status code and error messages.
    /// </summary>
    /// <typeparam name="T">Type of the returned data.</typeparam>
    public class ServiceResult<T>
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string? Error { get; set; }
        public T? Data { get; set; }

        public static ServiceResult<T> Ok(T data)
            => new ServiceResult<T> { Success = true, StatusCode = 200, Data = data };

        public static ServiceResult<T> Created(T data)
            => new ServiceResult<T> { Success = true, StatusCode = 201, Data = data };

        public static ServiceResult<T> Fail(string error, int statusCode)
            => new ServiceResult<T> { Success = false, StatusCode = statusCode, Error = error };
    }

    public class ServiceResult
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string? Error { get; set; }

        public static ServiceResult Ok()
            => new ServiceResult { Success = true, StatusCode = 204 };

        public static ServiceResult Fail(string error, int statusCode)
            => new ServiceResult { Success = false, StatusCode = statusCode, Error = error };
    }
}

