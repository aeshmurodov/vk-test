import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import {
  Group,
  Header,
  Div,
  Placeholder,
  Text,
  usePlatform,
  Platform,
} from '@vkontakte/vkui';
import { Icon56InfoOutline, Icon20ArrowUpOutline, Icon20ArrowDownOutline } from '@vkontakte/icons';
import { getUsers } from '../api/users';
import { User } from '../types';

interface UserTableProps {
  onUserAdded?: () => void;
}

const ITEMS_PER_PAGE = 10;

export const UserTable: React.FC<UserTableProps> = ({ onUserAdded }) => {
  const platform = usePlatform();
  const observer = useRef<IntersectionObserver | null>(null);
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useState<SortingState>([]);

  const sortBy = sorting.length > 0 ? (sorting[0].id as keyof User) : undefined;
  const sortOrder = sorting.length > 0 ? (sorting[0].desc ? 'desc' : 'asc') : undefined;

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
    queryKey: ['users', { sortBy, sortOrder }],
    queryFn: ({ pageParam = 1 }) =>
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
      queryClient.resetQueries({ queryKey: ['users'] });
      refetch();
      refetchTriggeredRef.current = true;
    } else if (!onUserAdded && refetchTriggeredRef.current) {
      refetchTriggeredRef.current = false;
    }
  }, [onUserAdded, refetch, queryClient]);

  const allUsers = data?.pages.flatMap((page) => page.users) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

  const table = useReactTable({
    data: allUsers,
    columns: React.useMemo(() => [
      { accessorKey: 'firstName', header: 'Имя', enableSorting: true },
      { accessorKey: 'lastName', header: 'Фамилия', enableSorting: true },
      { accessorKey: 'email', header: 'Email', enableSorting: true },
      { accessorKey: 'age', header: 'Возраст', enableSorting: true },
      { accessorKey: 'city', header: 'Город', enableSorting: true },
      { accessorKey: 'occupation', header: 'Занятие', enableSorting: true },
      { accessorKey: 'status', header: 'Статус', enableSorting: true },
      { accessorKey: 'joinedDate', header: 'Дата вступления', enableSorting: true },
    ], []),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: hasNextPage ? -1 : 1,
  });

  const lastUserElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
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
        header="Ошибка загрузки"
        action={<Div><Text onClick={() => refetch()}>Повторить</Text></Div>}
      >
        Не удалось загрузить данные: {error?.message}
      </Placeholder>
    );
  }

  if (allUsers.length === 0 && !isLoading) {
    return (
      <Placeholder
        icon={<Icon56InfoOutline />}
        header="Нет данных"
        action={<Div><Text onClick={() => refetch()}>Загрузить</Text></Div>}
      >
        Таблица пуста. Добавьте первую запись.
      </Placeholder>
    );
  }

  return (
    <Group header={<Header mode="secondary">Пользователи ({totalCount})</Header>}>
      <Div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${table.getAllColumns().length}, minmax(100px, 1fr))`,
        gap: '8px',
        padding: '0 12px',
        borderBottom: platform === Platform.VKCOM ? '1px solid var(--vkui--color_separator_alpha)' : 'none',
        fontWeight: 'bold'
      }}>
        {table.getHeaderGroups().map(headerGroup => (
          headerGroup.headers.map(header => (
            <Div
              key={header.id}
              onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
              style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Text>{flexRender(header.column.columnDef.header, header.getContext())}</Text>
              {header.column.getCanSort() && (
                header.column.getIsSorted() === 'asc' ? <Icon20ArrowUpOutline /> :
                header.column.getIsSorted() === 'desc' ? <Icon20ArrowDownOutline /> : null
              )}
            </Div>
          ))
        ))}
      </Div>

      {table.getRowModel().rows.map((row, index) => {
        const isLastElement = table.getRowModel().rows.length === index + 1;
        const rowContent = (
          <>
            {row.getVisibleCells().map(cell => (
              <Text key={cell.id}>
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
            }}
          >
            {rowContent}
          </Div>
        );
      })}

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
