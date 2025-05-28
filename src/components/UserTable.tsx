import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel, // Re-added: Needed for sorting
  flexRender,
  type SortingState, // Re-added: Needed for sorting state
} from '@tanstack/react-table';
import {
  Group,
  Header,
  Div,
  Placeholder,
  Title,
  Text,
  usePlatform,
  Platform,
} from '@vkontakte/vkui';
import { Icon56InfoOutline } from '@vkontakte/icons';
// Import icons for sorting direction
import {
  Icon16ArrowUpOutline,   // For ascending sort
  Icon16ArrowDownOutline,  // For descending sort
  Icon16ArrowRightOutline, // For unsorted/default state
} from '@vkontakte/icons';

import { getUsers } from '../api/users';
import { type User } from '../types';

interface UserTableProps {
  onUserAdded?: () => void;
}

const ITEMS_PER_PAGE = 10;

export const UserTable: React.FC<UserTableProps> = ({ onUserAdded }) => {
  const platform = usePlatform();
  const observer = useRef<IntersectionObserver | null>(null);
  const queryClient = useQueryClient();

  // Re-added: Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Re-added: Extracting sortBy and sortOrder from sorting state
  const sortBy = sorting.length > 0 ? (sorting[0].id as keyof User) : undefined;
  const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined;

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'firstName', header: 'Имя', cell: info => info.getValue() },
    { accessorKey: 'lastName', header: 'Фамилия', cell: info => info.getValue() },
    { accessorKey: 'email', header: 'Email', cell: info => info.getValue() },
    { accessorKey: 'age', header: 'Возраст', cell: info => info.getValue() },
    { accessorKey: 'city', header: 'Город', cell: info => info.getValue() },
    { accessorKey: 'occupation', header: 'Занятие', cell: info => info.getValue() },
    { accessorKey: 'status', header: 'Статус', cell: info => info.getValue() },
    { accessorKey: 'joinedDate', header: 'Дата вступления', cell: info => info.getValue() },
  ];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    // Re-added: sortBy and sortOrder to queryKey to refetch when sorting changes
    queryKey: ['users', { sortBy, sortOrder }],
    queryFn: ({ pageParam = 1 }) =>
      // Pass sortBy and sortOrder parameters to getUsers API call
      getUsers(pageParam, ITEMS_PER_PAGE, sortBy, sortOrder),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalCount = lastPage.totalCount;
      const loadedCount = currentPage * ITEMS_PER_PAGE;
      return loadedCount < totalCount ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const refetchTriggeredRef = useRef(false);

  useEffect(() => {
    if (onUserAdded && !refetchTriggeredRef.current) {
      // Invalidate queries to mark 'users' data as stale, triggering a refetch
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Explicitly refetch to get immediate feedback after user addition
      refetch();
      refetchTriggeredRef.current = true;
    } else if (!onUserAdded && refetchTriggeredRef.current) {
      refetchTriggeredRef.current = false;
    }
  }, [onUserAdded, refetch, queryClient]);

  const allUsers = data?.pages.flatMap((page) => page.users) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  const table = useReactTable<User>({
    data: allUsers,
    columns,
    // Re-added: Sorting state and handlers for React Table
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // Re-added: Enable sorted row model
    manualSorting: true, // Re-added: Tell React Table that sorting is handled manually (by API)
    manualPagination: true, // Pagination is still manual due to infinite scroll
    pageCount: hasNextPage ? -1 : 1, // -1 indicates unknown page count for infinite scrolling
  });

  const lastUserElementRef = useCallback((node: HTMLDivElement | null) => {
    // Only observe if data is not currently loading/fetching and there are more pages
    if (isLoading || isFetchingNextPage || !hasNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage(); // Fetch more data when the last element is visible
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  if (isLoading && !isFetchingNextPage) {
    return <Div style={{ textAlign: 'center', padding: '16px' }}><Text>Загрузка данных...</Text></Div>;
  }

  if (isError) {
    return (
      <Placeholder
        icon={<Icon56InfoOutline />}
        action={<Div><Text onClick={() => refetch()}>Повторить</Text></Div>}
      >
        <Title level="2" weight="2" style={{ marginBottom: 12 }}>
          Ошибка загрузки
        </Title>
        Не удалось загрузить данные: {error?.message}
      </Placeholder>
    );
  }

  if (allUsers.length === 0 && !isLoading) {
    return (
      <Placeholder
        icon={<Icon56InfoOutline />}
        action={<Div><Text onClick={() => refetch()}>Загрузить</Text></Div>}
      >
        <Title level="2" weight="2" style={{ marginBottom: 12 }}>
          Нет данных
        </Title>
        Таблица пуста. Добавьте первую запись.
      </Placeholder>
    );
  }

  return (
    <Group header={<Header>Пользователи ({allUsers.length} из {totalCount})</Header>}>
      {/* Wrapper for horizontal scrolling on smaller screens */}
      <Div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {/* Table Header */}
        <Div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${table.getAllColumns().length}, minmax(100px, 1fr))`,
          gap: '8px',
          padding: '0 12px',
          borderBottom: platform === Platform.VKCOM ? '1px solid var(--vkui--color_separator_alpha)' : 'none',
          fontWeight: 'bold',
          minWidth: `${table.getAllColumns().length * 100}px` // Ensure minimum width for grid to prevent collapse
        }}>
          {table.getHeaderGroups().map(headerGroup => (
            headerGroup.headers.map(header => (
              <Div
                key={header.id}
                style={{
                  cursor: header.column.getCanSort() ? 'pointer' : 'default', // Re-added: Cursor for sortable columns
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  textAlign: 'center',
                  justifyContent: 'center',
                  userSelect: 'none', // Prevent text selection on click
                }}
                // Re-added: Click handler to toggle sorting
                onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
              >
                <Text>{flexRender(header.column.columnDef.header, header.getContext())}</Text>
                {/* Re-added: Sorting indicator icons */}
                {header.column.getCanSort() && (
                  <span style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
                    {{
                      asc: <Icon16ArrowUpOutline />,
                      desc: <Icon16ArrowDownOutline />,
                    }[header.column.getIsSorted() as string] ?? <Icon16ArrowRightOutline style={{ opacity: 0.5 }}/>}
                  </span>
                )}
              </Div>
            ))
          ))}
        </Div>

        {/* Table Rows */}
        {table.getRowModel().rows.map((row, index) => {
          const isLastElement = table.getRowModel().rows.length === index + 1;
          const rowContent = (
            <>
              {row.getVisibleCells().map(cell => (
                <Text key={cell.id} style={{ textAlign: 'center' }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Text>
              ))}
            </>
          );
          return isLastElement ? (
            <div
              key={row.id}
              ref={lastUserElementRef}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${row.getVisibleCells().length}, minmax(100px, 1fr))`,
                gap: '8px',
                padding: '12px',
                borderBottom: platform === Platform.VKCOM ? '1px solid var(--vkui--color_separator_alpha)' : 'none',
                minWidth: `${row.getVisibleCells().length * 100}px` // Ensure minimum width for grid
              }}
            >
              {rowContent}
            </div>
          ) : (
            <Div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${row.getVisibleCells().length}, minmax(100px, 1fr))`,
                gap: '8px',
                padding: '12px',
                borderBottom: platform === Platform.VKCOM ? '1px solid var(--vkui--color_separator_alpha)' : 'none',
                minWidth: `${row.getVisibleCells().length * 100}px` // Ensure minimum width for grid
              }}
            >
              {rowContent}
            </Div>
          );
        })}
      </Div> {/* End of overflowX auto wrapper */}

      {isFetchingNextPage && (
        <Div style={{ textAlign: 'center', padding: '16px' }}>
          <Text>Загрузка...</Text>
        </Div>
      )}

      {!hasNextPage && allUsers.length > 0 && (
        <Div style={{ textAlign: 'center', color: 'var(--vkui--color_text_secondary)' }}>
          Все записи загружены.
        </Div>
      )}
    </Group>
  );
};