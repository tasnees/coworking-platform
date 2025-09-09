declare module 'react-hook-form' {
  import * as React from 'react';

  // Basic types
  export type FieldValues = Record<string, any>;
  export type FieldPath<TFieldValues extends FieldValues> = string & keyof TFieldValues;
  export type FieldPathValue<TFieldValues extends FieldValues, TFieldName extends FieldPath<TFieldValues>> = TFieldValues[TFieldName];
  
  // Form methods
  export interface UseFormMethods<TFieldValues extends FieldValues = FieldValues> {
    register: (name: FieldPath<TFieldValues>, rules?: any) => void;
    handleSubmit: (callback: (data: TFieldValues) => void) => (e?: React.BaseSyntheticEvent) => Promise<void>;
    watch: (names?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[]) => any;
    reset: (values?: TFieldValues) => void;
    setError: (name: FieldPath<TFieldValues>, error: { type: string; message: string }) => void;
    clearErrors: (name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[]) => void;
    setValue: (name: FieldPath<TFieldValues>, value: any, config?: { shouldValidate?: boolean }) => void;
    getValues: (payload?: { nest?: boolean }) => TFieldValues;
    trigger: (name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[]) => Promise<boolean>;
    control: any;
    formState: {
      isDirty: boolean;
      dirtyFields: Record<string, boolean>;
      isSubmitted: boolean;
      isSubmitSuccessful: boolean;
      submitCount: number;
      touched: Record<string, boolean>;
      isSubmitting: boolean;
      isValid: boolean;
      errors: Record<string, { message?: string; type: string }>;
    };
  }

  // UseForm hook
  export function useForm<TFieldValues extends FieldValues = FieldValues>(
    props?: UseFormProps<TFieldValues>
  ): UseFormMethods<TFieldValues>;

  // Form Provider
  export function FormProvider<TFieldValues extends FieldValues>({
    children,
    ...props
  }: FormProviderProps<TFieldValues>): JSX.Element;

  // Form Context
  export function useFormContext<TFieldValues extends FieldValues>(): UseFormMethods<TFieldValues>;

  // Controller
  export function Controller<TFieldValues extends FieldValues = FieldValues>({
    control,
    name,
    render,
    rules,
    ...rest
  }: ControllerProps<TFieldValues>): JSX.Element;

  // Types for props and options
  export interface UseFormProps<TFieldValues extends FieldValues> {
    defaultValues?: Partial<TFieldValues>;
    mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all';
    reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
    resolver?: any;
    context?: any;
    criteriaMode?: 'firstError' | 'all';
    shouldFocusError?: boolean;
    shouldUnregister?: boolean;
    shouldUseNativeValidation?: boolean;
  }

  export interface ControllerProps<TFieldValues extends FieldValues> {
    name: FieldPath<TFieldValues>;
    control?: any;
    rules?: any;
    defaultValue?: FieldPathValue<TFieldValues, FieldPath<TFieldValues>>;
    render: ({
      field: { onChange, onBlur, value, name, ref },
      fieldState: { invalid, isTouched, isDirty, error },
      formState,
    }: {
      field: {
        onChange: (...event: any[]) => void;
        onBlur: () => void;
        value: any;
        name: string;
        ref: React.Ref<any>;
      };
      fieldState: {
        invalid: boolean;
        isTouched: boolean;
        isDirty: boolean;
        error?: { message?: string; type: string };
      };
      formState: {
        errors: Record<string, { message?: string; type: string }>;
        isSubmitting: boolean;
        isSubmitted: boolean;
      };
    }) => React.ReactElement;
  }

  export interface FormProviderProps<TFieldValues extends FieldValues> {
    children: React.ReactNode;
    [key: string]: any;
  }

  // Field Array
  export interface FieldArrayMethods<TFieldValues extends FieldValues = FieldValues> {
    append: (value: any, shouldFocus?: boolean) => void;
    prepend: (value: any, shouldFocus?: boolean) => void;
    remove: (index?: number | number[]) => void;
    swap: (indexA: number, indexB: number) => void;
    move: (from: number, to: number) => void;
    insert: (index: number, value: any, shouldFocus?: boolean) => void;
    fields: Array<{ id: string } & TFieldValues>;
  }

  export function useFieldArray<TFieldValues extends FieldValues = FieldValues>({
    control,
    name,
  }: {
    control?: any;
    name: string;
  }): FieldArrayMethods<TFieldValues>;
}
