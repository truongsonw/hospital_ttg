namespace Contracts.System.DTOs;

public class CreateSysCategoryRequest
{
    public string? Code { get; set; }
    public string? Name { get; set; }
    public int Type { get; set; }
    public string? Description { get; set; }
    public bool? Active { get; set; } = true;
    public Guid? ParentId { get; set; }
    public string? Ext1s { get; set; }
    public decimal? Ext1d { get; set; }
}
