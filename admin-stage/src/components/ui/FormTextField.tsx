import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { Controller, Control } from 'react-hook-form';

interface FormTextFieldProps extends Omit<TextFieldProps, 'name' | 'control'> {
  name: string;
  control: Control<any>;
}

export default function FormTextField({ name, control, ...props }: FormTextFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...props}
          error={!!error}
          helperText={error?.message}
          fullWidth
        />
      )}
    />
  );
}

