// src/components/UserForm.tsx
import React from 'react';
import { useForm, SubmitHandler, FieldErrors, Controller } from 'react-hook-form';
import {
  Group,
  Header,
  FormItem,
  Input,
  Button,
  FormStatus,
  Select,
  RadioGroup,
  Radio,
} from '@vkontakte/vkui';
import { NewUserFormData } from '../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addUser } from '../api/users';

interface UserFormProps {
  onSuccess: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ onSuccess }) => {
  const {
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
    control,
  } = useForm<NewUserFormData>();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      reset();
      onSuccess();
    },
    onError: (error) => {
      console.error("Error adding user:", error);
    },
  });

  const onSubmit: SubmitHandler<NewUserFormData> = async (data) => {
    mutation.mutate(data);
  };

  const formErrors = Object.keys(errors).length > 0 && (
    <FormStatus header="Ошибки заполнения" mode="error">
      {Object.values(errors).map((error, index) => (
        <li key={index}>{(error as any).message || 'Неизвестная ошибка'}</li>
      ))}
    </FormStatus>
  );

  return (
    <Group header={<Header mode="secondary">Добавить нового пользователя</Header>}>
      {formErrors}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Input: First Name - Using Controller */}
        <FormItem
          top="Имя"
          status={errors.firstName ? 'error' : 'default'}
          bottom={errors.firstName && errors.firstName.message}
        >
          <Controller
            name="firstName"
            control={control}
            rules={{
              required: 'Имя обязательно',
              minLength: { value: 2, message: 'Минимум 2 символа' },
            }}
            render={({ field: { ref, ...restField } }) => ( // Destructure ref, take rest of the fields
              <Input
                type="text"
                placeholder="Введите имя"
                {...restField} // Spreads name, onBlur, onChange, value
                getRootRef={ref}   // Explicitly pass the ref to VKUI's getRootRef
              />
            )}
          />
        </FormItem>

        {/* Input: Last Name - Using Controller */}
        <FormItem
          top="Фамилия"
          status={errors.lastName ? 'error' : 'default'}
          bottom={errors.lastName && errors.lastName.message}
        >
          <Controller
            name="lastName"
            control={control}
            rules={{
              required: 'Фамилия обязательна',
              minLength: { value: 2, message: 'Минимум 2 символа' },
            }}
            render={({ field: { ref, ...restField } }) => (
              <Input
                type="text"
                placeholder="Введите фамилию"
                {...restField}
                getRootRef={ref}
              />
            )}
          />
        </FormItem>

        {/* Input: Email - Using Controller */}
        <FormItem
          top="Email"
          status={errors.email ? 'error' : 'default'}
          bottom={errors.email && errors.email.message}
        >
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'Email обязателен',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: 'Некорректный формат email',
              },
            }}
            render={({ field: { ref, ...restField } }) => (
              <Input
                type="email"
                placeholder="example@mail.com"
                {...restField}
                getRootRef={ref}
              />
            )}
          />
        </FormItem>

        {/* Input: Age - Using Controller */}
        <FormItem
          top="Возраст"
          status={errors.age ? 'error' : 'default'}
          bottom={errors.age && errors.age.message}
        >
          <Controller
            name="age"
            control={control}
            rules={{
              required: 'Возраст обязателен',
              min: { value: 18, message: 'Возраст должен быть не менее 18' },
              max: { value: 99, message: 'Возраст должен быть не более 99' },
              valueAsNumber: true,
            }}
            render={({ field: { ref, ...restField } }) => (
              <Input
                type="number"
                placeholder="Введите возраст"
                {...restField}
                getRootRef={ref}
              />
            )}
          />
        </FormItem>

        {/* Select: City - Using Controller */}
        <FormItem
          top="Город"
          status={errors.city ? 'error' : 'default'}
          bottom={errors.city && errors.city.message}
        >
          <Controller
            name="city"
            control={control}
            rules={{ required: 'Город обязателен' }}
            render={({ field: { ref, ...restField } }) => (
              <Select
                placeholder="Выберите город"
                {...restField}
                getRootRef={ref}
                options={[
                  { value: '', label: 'Не выбрано' },
                  { value: 'Москва', label: 'Москва' },
                  { value: 'Санкт-Петербург', label: 'Санкт-Петербург' },
                  { value: 'Казань', label: 'Казань' },
                  { value: 'Новосибирск', label: 'Новосибирск' },
                  { value: 'Екатеринбург', label: 'Екатеринбург' },
                ]}
              />
            )}
          />
        </FormItem>

        {/* Input: Occupation - Using Controller */}
        <FormItem
          top="Род занятий"
          status={errors.occupation ? 'error' : 'default'}
          bottom={errors.occupation && errors.occupation.message}
        >
          <Controller
            name="occupation"
            control={control}
            rules={{
              required: 'Род занятий обязателен',
              minLength: { value: 3, message: 'Минимум 3 символа' },
            }}
            render={({ field: { ref, ...restField } }) => (
              <Input
                type="text"
                placeholder="Например, Разработчик"
                {...restField}
                getRootRef={ref}
              />
            )}
          />
        </FormItem>

        {/* RadioGroup: Status - Using Controller */}
        <FormItem
          top="Статус"
          status={errors.status ? 'error' : 'default'}
          bottom={errors.status && errors.status.message}
        >
          <Controller
            name="status"
            control={control}
            rules={{ required: 'Статус обязателен' }}
            render={({ field: { ref, ...restField } }) => (
              <RadioGroup
                {...restField}
                getRootRef={ref}
              >
                <Radio value="Активен">Активен</Radio>
                <Radio value="Неактивен">Неактивен</Radio>
              </RadioGroup>
            )}
          />
        </FormItem>

        <FormItem>
          <Button
            size="l"
            stretched
            type="submit"
            disabled={mutation.isPending || !isDirty}
          >
            {mutation.isPending ? 'Отправка...' : 'Добавить запись'}
          </Button>
        </FormItem>
        {mutation.isSuccess && (
          <FormStatus header="Успех!" mode="done">
            Пользователь успешно добавлен.
          </FormStatus>
        )}
        {mutation.isError && (
          <FormStatus header="Ошибка" mode="error">
            Не удалось добавить пользователя: {mutation.error?.message || 'Неизвестная ошибка.'}
          </FormStatus>
        )}
      </form>
    </Group>
  );
};