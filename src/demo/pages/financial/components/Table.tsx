import * as React from 'react';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  GripVerticalIcon,
  LoaderIcon,
  MoreVerticalIcon,
  PlusIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { toast } from 'sonner';
import { z } from 'zod';

import { useIsMobile } from '../../../hooks/useIsMobile';
import { Badge } from '../../../base/badge';
import { Button } from '../../../base/button';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../../../base/chart';
import { Checkbox } from '../../../base/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../base/dropdown-menu';
import { Input } from '../../../base/input';
import { Label } from '../../../base/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../base/select';
import { Separator } from '../../../base/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../../base/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../base/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../base/tabs';

export const schema = z.object({
  id: z.number(),
  description: z.string(),
  amount: z.string(),
  date: z.string(),
  category: z.string(),
  account: z.string(),
  status: z.string(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-[#A9B2C1] hover:bg-transparent hover:text-[#00E5FF]"
    >
      <GripVerticalIcon className="size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: 'drag',
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'description',
    header: 'Source Name',
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: 'amount',
    header: () => <div className="w-full text-right">Endpoint / Port</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.description}`,
            success: 'Done',
            error: 'Error',
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-amount`} className="sr-only">
          Endpoint / Port
        </Label>
        <Input
          className="h-8 min-w-16 border-[#2A2F37] bg-[#0E0F13] justify-end text-right text-[#F5F7FA] hover:bg-[#1A1D23] hover:border-[#00E5FF]/30 focus-visible:border-[#00E5FF] focus-visible:bg-[#1A1D23] focus-visible:ring-[#00E5FF]/20"
          defaultValue={row.original.amount}
          id={`${row.original.id}-amount`}
        />
      </form>
    ),
  },
  {
    accessorKey: 'date',
    header: () => <div className="w-full text-right">Connected On</div>,
    cell: ({ row }) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
            loading: `Saving ${row.original.description}`,
            success: 'Done',
            error: 'Error',
          });
        }}
      >
        <Label htmlFor={`${row.original.id}-date`} className="sr-only">
          Connected On
        </Label>
        <Input
          className="h-8 min-w-16 border-transparent bg-transparent text-right text-[#F5F7FA] shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
          defaultValue={row.original.date}
          id={`${row.original.id}-date`}
        />
      </form>
    ),
  },
  {
    accessorKey: 'account',
    header: 'Environment / Cluster',
    cell: ({ row }) => {
      const accountValue = row.original.account.toLowerCase() || undefined;

      return (
        <>
          <Label htmlFor={`${row.original.id}-account`} className="sr-only">
            Environment / Cluster
          </Label>
          <Select defaultValue={accountValue}>
            <SelectTrigger
              className="h-8 w-40 bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] hover:border-[#00E5FF]/50"
              id={`${row.original.id}-account`}
            >
              <SelectValue placeholder="Assign environment / cluster" />
            </SelectTrigger>
            <SelectContent align="end" className="bg-[#1A1D23] border-[#2A2F37]">
              {accountValue}
              <SelectItem value="production" className="text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]">
                Production
              </SelectItem>
              <SelectItem value="staging" className="text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]">
                Staging
              </SelectItem>
              <SelectItem value="dev" className="text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]">
                Dev
              </SelectItem>
              <SelectItem value="eu-cluster" className="text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]">
                EU-Cluster
              </SelectItem>
              <SelectItem value="us-west-cluster" className="text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]">
                US-West-Cluster
              </SelectItem>
              <SelectItem value="business" className="text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]">
                Staging
              </SelectItem>
              <SelectItem value="personal" className="text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]">
                US-West-Cluster
              </SelectItem>
              <SelectItem value="cash" className="text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]">
                EU-Cluster
              </SelectItem>
            </SelectContent>
          </Select>
        </>
      );
    },
  },
  {
    accessorKey: 'category',
    header: 'Monitoring Category',
    cell: ({ row }) => (
      <div className="w-32">
        <Badge
          variant="outline"
          className="px-2 py-0.5 text-[#A9B2C1] border-[#2A2F37] bg-[#0E0F13] hover:border-[#00E5FF]/30 hover:text-[#00E5FF] transition-colors"
        >
          {row.original.category}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Connection Status',
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={`flex gap-1.5 px-2 py-0.5 border [&_svg]:size-3 ${
          row.original.status === 'active'
            ? 'text-[#2AD39B] border-[#2AD39B]/30 bg-[#2AD39B]/10 shadow-[0_0_8px_rgba(42,211,155,0.2)]'
            : 'text-[#FFC043] border-[#FFC043]/30 bg-[#FFC043]/10'
        }`}
      >
        {row.original.status === 'active' ? (
          <CheckCircle2Icon className="text-[#2AD39B]" />
        ) : (
          <LoaderIcon className="animate-spin" />
        )}
        {row.original.status === 'active' ? 'Active' : 'Pending Setup'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-[#A9B2C1] hover:text-[#00E5FF] hover:bg-[#2A2F37] data-[state=open]:bg-[#2A2F37]"
            size="icon"
          >
            <MoreVerticalIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32 bg-[#1A1D23] border-[#2A2F37]">
          <DropdownMenuItem className="text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]">Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]">
            Make a copy
          </DropdownMenuItem>
          <DropdownMenuItem className="text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]">Favorite</DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#2A2F37]" />
          <DropdownMenuItem className="text-[#FF5C81] hover:bg-[#2A2F37] focus:bg-[#2A2F37]">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && 'selected'}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 border-b border-[#2A2F37] bg-[#1A1D23] hover:bg-[#0E0F13] data-[selected=true]:bg-[#0E0F13] data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 data-[dragging=true]:border-[#00E5FF]/50"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({ data: initialData }: { data: z.infer<typeof schema>[] }) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

  // Update data when initialData changes
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs defaultValue="outline" className="flex w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="outline">
          <SelectTrigger
            className="@4xl/main:hidden flex w-fit bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] hover:border-[#00E5FF]/50"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1D23] border-[#2A2F37]">
            <SelectItem value="outline" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
              Infrastructure
            </SelectItem>
            <SelectItem value="past-performance" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
              Services
            </SelectItem>
            <SelectItem value="key-personnel" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
              Logs
            </SelectItem>
            <SelectItem value="focus-documents" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
              Traces
            </SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="@4xl/main:flex hidden bg-[#0E0F13] border-[#2A2F37]">
          <TabsTrigger
            value="outline"
            className="text-[#A9B2C1] data-[state=active]:text-[#00E5FF] data-[state=active]:border-b-2 data-[state=active]:border-[#00E5FF]"
          >
            Infrastructure
          </TabsTrigger>
          <TabsTrigger
            value="past-performance"
            className="gap-1 text-[#A9B2C1] data-[state=active]:text-[#00E5FF] data-[state=active]:border-b-2 data-[state=active]:border-[#00E5FF]"
          >
            Services{' '}
          </TabsTrigger>
          <TabsTrigger
            value="key-personnel"
            className="gap-1 text-[#A9B2C1] data-[state=active]:text-[#00E5FF] data-[state=active]:border-b-2 data-[state=active]:border-[#00E5FF]"
          >
            Logs{' '}
            <Badge
              variant="secondary"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30"
            >
              3
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="focus-documents"
            className="text-[#A9B2C1] data-[state=active]:text-[#00E5FF] data-[state=active]:border-b-2 data-[state=active]:border-[#00E5FF]"
          >
            Traces
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="bg-[#0E0F13] border-[#2A2F37] text-[#A9B2C1] hover:bg-[#1A1D23] hover:border-[#00E5FF]/50 hover:text-[#00E5FF]"
              >
                <ColumnsIcon />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#1A1D23] border-[#2A2F37]">
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-[#F5F7FA] hover:bg-[#2A2F37] focus:bg-[#2A2F37]"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#0E0F13] border-[#2A2F37] text-[#A9B2C1] hover:bg-[#1A1D23] hover:border-[#00E5FF]/50 hover:text-[#00E5FF]"
          >
            <PlusIcon />
            <span className="hidden lg:inline">Add Section</span>
          </Button>
        </div>
      </div>
      <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border border-[#2A2F37] bg-[#1A1D23] shadow-lg">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-[#0E0F13] border-b border-[#2A2F37]">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className="text-[#A9B2C1] font-semibold uppercase text-xs tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-[#A9B2C1]">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-[#A9B2C1] lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium text-[#A9B2C1]">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger
                  className="w-20 bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] hover:border-[#00E5FF]/50"
                  id="rows-per-page"
                >
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top" className="bg-[#1A1D23] border-[#2A2F37]">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`} className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium text-[#F5F7FA]">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex bg-[#0E0F13] border-[#2A2F37] text-[#A9B2C1] hover:bg-[#1A1D23] hover:border-[#00E5FF]/50 hover:text-[#00E5FF] disabled:opacity-30"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8 bg-[#0E0F13] border-[#2A2F37] text-[#A9B2C1] hover:bg-[#1A1D23] hover:border-[#00E5FF]/50 hover:text-[#00E5FF] disabled:opacity-30"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8 bg-[#0E0F13] border-[#2A2F37] text-[#A9B2C1] hover:bg-[#1A1D23] hover:border-[#00E5FF]/50 hover:text-[#00E5FF] disabled:opacity-30"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex bg-[#0E0F13] border-[#2A2F37] text-[#A9B2C1] hover:bg-[#1A1D23] hover:border-[#00E5FF]/50 hover:text-[#00E5FF] disabled:opacity-30"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="past-performance" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="focus-documents" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}

const chartData = [
  { month: 'January', desktop: 186, mobile: 80 },
  { month: 'February', desktop: 305, mobile: 200 },
  { month: 'March', desktop: 237, mobile: 120 },
  { month: 'April', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'June', desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: '#00E5FF',
  },
  mobile: {
    label: 'Mobile',
    color: '#00B8D4',
  },
} satisfies ChartConfig;

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-[#00E5FF] hover:text-[#00B8D4] hover:underline">
          {item.description}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col bg-[#1A1D23] border-l border-[#2A2F37] text-[#F5F7FA]">
        <SheetHeader className="gap-1 border-b border-[#2A2F37] pb-4">
          <SheetTitle className="text-[#F5F7FA]">{item.description}</SheetTitle>
          <SheetDescription className="text-[#A9B2C1]">Monitoring source details and configuration</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} stroke="#2A2F37" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                  <Area dataKey="mobile" type="natural" fill="#00B8D4" fillOpacity={0.3} stroke="#00B8D4" stackId="a" />
                  <Area
                    dataKey="desktop"
                    type="natural"
                    fill="#00E5FF"
                    fillOpacity={0.4}
                    stroke="#00E5FF"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator className="bg-[#2A2F37]" />
              <div className="grid gap-2">
                <div className="flex gap-2 font-medium leading-none text-[#2AD39B]">
                  Trending up by 5.2% this month <TrendingUpIcon className="size-4" />
                </div>
                <div className="text-[#A9B2C1]">
                  Showing monitoring metrics for the last 6 months. This source has been actively collecting data and
                  spans multiple lines and should wrap around.
                </div>
              </div>
              <Separator className="bg-[#2A2F37]" />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="description" className="text-[#F5F7FA]">
                Source Name
              </Label>
              <Input
                id="description"
                defaultValue={item.description}
                className="bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="category" className="text-[#F5F7FA]">
                  Monitoring Category
                </Label>
                <Select defaultValue={item.category}>
                  <SelectTrigger
                    id="category"
                    className="w-full bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] hover:border-[#00E5FF]/50"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1D23] border-[#2A2F37]">
                    <SelectItem value="Infrastructure" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                      Infrastructure
                    </SelectItem>
                    <SelectItem value="Services" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                      Services
                    </SelectItem>
                    <SelectItem value="Logs" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                      Logs
                    </SelectItem>
                    <SelectItem value="Traces" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                      Traces
                    </SelectItem>
                    <SelectItem value="Database" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                      Database
                    </SelectItem>
                    <SelectItem value="Network" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                      Network
                    </SelectItem>
                    <SelectItem value="Cloud" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                      Cloud
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="status" className="text-[#F5F7FA]">
                  Connection Status
                </Label>
                <Select defaultValue={item.status}>
                  <SelectTrigger
                    id="status"
                    className="w-full bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] hover:border-[#00E5FF]/50"
                  >
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1D23] border-[#2A2F37]">
                    <SelectItem value="active" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                      Active
                    </SelectItem>
                    <SelectItem value="pending" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                      Pending Setup
                    </SelectItem>
                    <SelectItem value="disabled" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                      Disabled
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="target" className="text-[#F5F7FA]">
                  Endpoint / Port
                </Label>
                <Input
                  id="amount"
                  defaultValue={item.amount}
                  className="bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="date" className="text-[#F5F7FA]">
                  Connected On
                </Label>
                <Input
                  id="date"
                  defaultValue={item.date}
                  className="bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="account" className="text-[#F5F7FA]">
                Environment / Cluster
              </Label>
              <Select defaultValue={item.account}>
                <SelectTrigger
                  id="account"
                  className="w-full bg-[#0E0F13] border-[#2A2F37] text-[#F5F7FA] hover:border-[#00E5FF]/50"
                >
                  <SelectValue placeholder="Select an environment" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D23] border-[#2A2F37]">
                  <SelectItem value="production" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                    Production
                  </SelectItem>
                  <SelectItem value="staging" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                    Staging
                  </SelectItem>
                  <SelectItem value="dev" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                    Dev
                  </SelectItem>
                  <SelectItem value="eu-cluster" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                    EU-Cluster
                  </SelectItem>
                  <SelectItem value="us-west-cluster" className="text-[#F5F7FA] hover:bg-[#2A2F37]">
                    US-West-Cluster
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0 border-t border-[#2A2F37] pt-4">
          <Button className="w-full bg-[#00E5FF] text-[#0E0F13] hover:bg-[#00B8D4] shadow-[0_0_12px_rgba(0,229,255,0.4)]">
            Submit
          </Button>
          <SheetClose asChild>
            <Button
              variant="outline"
              className="w-full bg-[#0E0F13] border-[#2A2F37] text-[#A9B2C1] hover:bg-[#1A1D23] hover:border-[#2A2F37] hover:text-[#F5F7FA]"
            >
              Done
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
