import React, { useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  Group,
  Header,
  Div,
// - Cell, // REMOVE Cell from imports
  Placeholder,
  Text,
  usePlatform,
  Platform,
} from '@vkontakte/vkui';
import { Icon56InfoOutline } from '@vkontakte/icons';
import { getUsers } from '../api/users';
import { User } from '../types';

interface UserTableProps {
  onUserAdded: () => void;
}

const ITEMS_PER_PAGE = 10;

export const UserTable: React.FC<UserTableProps> = ({ onUserAdded }) => {
  const platform = usePlatform();
  const observer = useRef<IntersectionObserver | null>(null);

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
    queryKey: ['users'],
    queryFn: ({ pageParam = 1 }) => getUsers(pageParam, ITEMS_PER_PAGE),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalCount = lastPage.totalCount;
      const loadedCount = currentPage * ITEMS_PER_PAGE;
      return loadedCount < totalCount ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });

  React.useEffect(() => {
    onUserAdded && refetch();
  }, [onUserAdded, refetch]);

  const lastUserElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  if (isLoading) {
    // TEMPORARY replacement for PanelSpinner
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

  const allUsers = data?.pages.flatMap((page) => page.users) || [];
  const totalCount = data?.pages[0]?.totalCount || 0;

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

  const headers = [
    { key: 'firstName', title: 'Имя' },
    { key: 'lastName', title: 'Фамилия' },
    { key: 'email', title: 'Email' },
    { key: 'age', title: 'Возраст' },
    { key: 'city', title: 'Город' },
    { key: 'occupation', title: 'Занятие' },
    { key: 'status', title: 'Статус' },
    { key: 'joinedDate', title: 'Дата вступления' },
  ];

  return (
    <Group header={<Header mode="secondary">Пользователи ({totalCount})</Header>}>
      {/* Table Header Row */}
      <Div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${headers.length}, minmax(100px, 1fr))`,
        gap: '8px',
        padding: '0 12px',
        borderBottom: platform === Platform.VKCOM ? '1px solid var(--vkui--color_separator_alpha)' : 'none',
        fontWeight: 'bold'
      }}>
        {headers.map(header => (
          <Text key={header.key}>{header.title}</Text>
        ))}
      </Div>

      {/* Table Data Rows */}
      {allUsers.map((user, index) => {
        const isLastElement = allUsers.length === index + 1;
        return (
          // --- CHANGED Cell TO Div for table rows ---
          <Div
            key={user.id}
            ref={isLastElement ? lastUserElementRef : null} // Use 'ref' for plain DOM elements
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${headers.length}, minmax(100px, 1fr))`,
              gap: '8px',
              padding: '12px', // Add padding to mimic Cell's spacing
              borderBottom: platform === Platform.VKCOM ? '1px solid var(--vkui--color_separator_alpha)' : 'none', // Add separator for rows
            }}
          >
            {headers.map(header => (
              <Text key={`${user.id}-${header.key}`}>
                {String(user[header.key as keyof User])}
              </Text>
            ))}
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