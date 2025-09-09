declare module 'input-otp' {
  import * as React from 'react';

  export interface OTPInputProps extends React.HTMLAttributes<HTMLDivElement> {
    maxLength?: number;
    value?: string;
    onChange?: (value: string) => void;
    onComplete?: (value: string) => void;
    containerClassName?: string;
    children?: React.ReactNode;
    render: (props: {
      slots: {
        [key: number]: {
          char: string;
          hasFakeCaret: boolean;
          isActive: boolean;
        };
      };
    }) => React.ReactNode;
  }

  export const OTPInput: React.ForwardRefExoticComponent<
    OTPInputProps & React.RefAttributes<HTMLDivElement>
  >;

  export const OTPInputGroup: React.FC<{ children: React.ReactNode }>;
  export const OTPInputSlot: React.FC<{
    index: number;
    className?: string;
    children?: React.ReactNode;
  }>;

  export const OTPInputContext: React.Context<{
    slots: {
      [key: number]: {
        char: string;
        hasFakeCaret: boolean;
        isActive: boolean;
      };
    };
  }>;
}
