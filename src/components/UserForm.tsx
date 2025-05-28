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
  Textarea,
  RadioGroup,
  Radio,
  // ScreenSpinner, // Removed as you're not using it directly
  // Spinner,       // Removed from import since it's no longer used in the button
} from '@vkontakte/vkui'; // Removed Spinner from import if not used elsewhere
import { NewUserFormData } from '../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addUser } from '../api/users';

interface UserFormProps {
  onSuccess: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
    control,
  } = useForm<NewUserFormData>();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      // Invalidate and refetch the 'users' query to update the table
      queryClient.invalidateQueries({ queryKey: ['users'] });
      reset(); // Clear the form
      onSuccess(); // Call success callback
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
        {/* Minimum 5 fields as per requirements */}
        <FormItem
          top="Имя"
          status={errors.firstName ? 'error' : 'default'}
          bottom={errors.firstName && errors.firstName.message}
        >
          <Input
            type="text"
            placeholder="Введите имя"
            {...register('firstName', {
              required: 'Имя обязательно',
              minLength: { value: 2, message: 'Минимум 2 символа' },
            })}
          />
        </FormItem>

        <FormItem
          top="Фамилия"
          status={errors.lastName ? 'error' : 'default'}
          bottom={errors.lastName && errors.lastName.message}
        >
          <Input
            type="text"
            placeholder="Введите фамилию"
            {...register('lastName', {
              required: 'Фамилия обязательна',
              minLength: { value: 2, message: 'Минимум 2 символа' },
            })}
          />
        </FormItem>

        <FormItem
          top="Email"
          status={errors.email ? 'error' : 'default'}
          bottom={errors.email && errors.email.message}
        >
          <Input
            type="email"
            placeholder="example@mail.com"
            {...register('email', {
              required: 'Email обязателен',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                message: 'Некорректный формат email',
              },
            })}
          />
        </FormItem>

        <FormItem
          top="Возраст"
          status={errors.age ? 'error' : 'default'}
          bottom={errors.age && errors.age.message}
        >
          <Input
            type="number"
            placeholder="Введите возраст"
            {...register('age', {
              required: 'Возраст обязателен',
              min: { value: 18, message: 'Возраст должен быть не менее 18' },
              max: { value: 99, message: 'Возраст должен быть не более 99' },
              valueAsNumber: true, // Convert to number
            })}
          />
        </FormItem>

        <FormItem
          top="Город"
          status={errors.city ? 'error' : 'default'}
          bottom={errors.city && errors.city.message}
        >
          <Select
            placeholder="Выберите город"
            {...register('city', { required: 'Город обязателен' })}
            options={[
              { value: '', label: 'Не выбрано' },
              { value: 'Москва', label: 'Москва' },
              { value: 'Санкт-Петербург', label: 'Санкт-Петербург' },
              { value: 'Казань', label: 'Казань' },
              { value: 'Новосибирск', label: 'Новосибирск' },
              { value: 'Екатеринбург', label: 'Екатеринбург' },
            ]}
          />
        </FormItem>

        {/* Additional fields to exceed 5 */}
        <FormItem
          top="Род занятий"
          status={errors.occupation ? 'error' : 'default'}
          bottom={errors.occupation && errors.occupation.message}
        >
          <Input
            type="text"
            placeholder="Например, Разработчик"
            {...register('occupation', {
              required: 'Род занятий обязателен',
              minLength: { value: 3, message: 'Минимум 3 символа' },
            })}
          />
        </FormItem>

        <FormItem
          top="Статус"
          status={errors.status ? 'error' : 'default'}
          bottom={errors.status && errors.status.message}
        >
          <Controller
            name="status" // The name of the field in your form data
            control={control} // Pass the control object from useForm
            rules={{ required: 'Статус обязателен' }} // Validation rules
            render={({ field }) => ( // Render prop gives you the field props
              <RadioGroup {...field}> {/* Spread field props (value, onChange, onBlur, name) */}
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
            disabled={mutation.isPending || !isDirty} // Disable if submitting or no changes
          >
            {'Добавить запись'} {/* <--- MODIFIED HERE: Spinner removed */}
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