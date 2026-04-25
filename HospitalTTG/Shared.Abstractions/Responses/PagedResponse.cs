namespace Shared.Abstractions.Responses;

public class PagedResponse<T> : ApiResponse<T>
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public int TotalRecords { get; set; }

    public PagedResponse(T data, int pageNumber, int pageSize, int totalRecords, string? message = null) 
        : base(data, message)
    {
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalRecords = totalRecords;
        TotalPages = pageSize > 0 ? (int)Math.Ceiling(totalRecords / (double)pageSize) : 0;
    }
}
