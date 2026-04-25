namespace Contracts.System.DTOs;

public class SysCategoryDto
{
    public Guid Id { get; set; }
    public string? Code { get; set; }
    public string? Name { get; set; }
    public int Type { get; set; }
    public string? Description { get; set; }
    public bool? Active { get; set; }
    public bool? Deleted { get; set; }
    public int? CreateBy { get; set; }
    public DateTime? CreateDTG { get; set; }
    public int? UpdateBy { get; set; }
    public DateTime? UpdateDTG { get; set; }
    public Guid? ParentId { get; set; }
    public string? Ext1s { get; set; }
    public decimal? Ext1d { get; set; }
}
