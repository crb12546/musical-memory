import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { api } from "../../lib/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
// Removed ProjectDetail import as it's replaced by edit functionality
import type { Project } from "../../lib/api";
import { format } from "date-fns";

const statusOptions = [
  { value: "all", label: "全部状态" },
  { value: "draft", label: "草稿" },
  { value: "open", label: "进行中" },
  { value: "in-progress", label: "面试中" },
  { value: "on-hold", label: "暂停" },
  { value: "closed", label: "已完成" },
];

const priorityOptions = [
  { value: "all", label: "全部优先级" },
  { value: "low", label: "低" },
  { value: "normal", label: "普通" },
  { value: "high", label: "高" },
  { value: "urgent", label: "紧急" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'bg-gray-500';
    case 'open': return 'bg-green-500';
    case 'in-progress': return 'bg-blue-500';
    case 'on-hold': return 'bg-yellow-500';
    case 'closed': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'draft': return '草稿';
    case 'open': return '进行中';
    case 'in-progress': return '面试中';
    case 'on-hold': return '暂停';
    case 'closed': return '已完成';
    default: return status;
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'low': return '低';
    case 'normal': return '普通';
    case 'high': return '高';
    case 'urgent': return '紧急';
    default: return priority;
  }
};

export function ProjectList({ 
  projects,
  onProjectSelect
}: { 
  projects: Project[];
  onProjectSelect?: (project: Project) => void;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  // Removed selectedProject state as it's handled by parent component
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [priorityFilter, setPriorityFilter] = React.useState("all");

  const filteredProjects = React.useMemo(() => {
    return projects.filter(project => {
      const matchesStatus = statusFilter === "all" || project.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter;
      return matchesStatus && matchesPriority;
    });
  }, [projects, statusFilter, priorityFilter]);

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "title",
      header: "职位名称",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "department",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            部门
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "headcount",
      header: "招聘人数",
    },
    {
      accessorKey: "priority",
      header: "优先级",
      cell: ({ row }) => (
        <div>{getPriorityLabel(row.getValue("priority"))}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge className={getStatusColor(status)}>
            {getStatusLabel(status)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "target_date",
      header: "目标日期",
      cell: ({ row }) => format(new Date(row.getValue("target_date")), 'yyyy-MM-dd'),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const project = row.original;
 
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">打开菜单</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onProjectSelect?.(project)}>
                编辑项目
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                const updatedData = { ...project, status: project.status === 'open' ? 'closed' : 'open' };
                api.updateProject(project.id, updatedData)
                  .then(() => {
                    toast.success('项目状态已更新');
                    window.location.reload();
                  })
                  .catch((error: Error) => {
                    toast.error('更新失败: ' + error.message);
                  });
              }}>
                {project.status === 'open' ? '关闭项目' : '重新开启'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                if (window.confirm('确定要删除这个项目吗？此操作无法撤销。')) {
                  api.deleteProject(project.id)
                    .then(() => {
                      toast.success('项目已删除');
                      window.location.reload();
                    })
                    .catch((error: Error) => {
                      toast.error('删除失败: ' + error.message);
                    });
                }
              }}>
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];

  const table = useReactTable({
    data: filteredProjects,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8 bg-white p-6 rounded-lg shadow-sm">
        <Input
          placeholder="搜索职位名称..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="w-full md:w-64"
        />
        <Input
          placeholder="搜索部门..."
          value={(table.getColumn("department")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("department")?.setFilterValue(event.target.value)
          }
          className="w-full md:w-64"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择状态" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择优先级" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-gray-200">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="bg-gray-50/50 px-4 py-3.5 text-gray-700 text-sm font-medium tracking-wide">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3.5 text-sm text-gray-600">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center h-[300px] text-gray-500">暂无数据</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
        </Table>
      </div>
      <div className="mt-6 flex items-center justify-between px-4">
        <div className="text-sm text-gray-500">
          共 {table.getFilteredRowModel().rows.length} 条记录
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="min-w-[80px]"
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="min-w-[80px]"
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}
