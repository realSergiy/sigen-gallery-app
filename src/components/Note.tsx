import { ComponentProps, ReactNode } from 'react';
import Container from './Container';
import AnimateItems from './AnimateItems';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { clsx } from 'clsx/lite';

export default function Note(
  props: {
    icon?: ReactNode;
    animate?: boolean;
    cta?: ReactNode;
    hideIcon?: boolean;
  } & ComponentProps<typeof Container>,
) {
  const { icon, animate, cta, hideIcon, color = 'blue', padding, children, ...rest } = props;

  return (
    <AnimateItems
      type={animate ? 'bottom' : 'none'}
      items={[
        <Container
          {...rest}
          key="Banner"
          color={color}
          padding={padding ?? (cta ? 'tight-cta-right' : 'tight')}
        >
          <div className={clsx('flex w-full items-center gap-2.5')}>
            {!hideIcon && (
              <span className={clsx('flex w-5 shrink-0 justify-center', 'opacity-90')}>
                {icon ?? (
                  <IoInformationCircleOutline
                    size={19}
                    className="translate-x-[0.5px] translate-y-[0.5px]"
                  />
                )}
              </span>
            )}
            <span className="grow text-sm">{children}</span>
            {cta && <span>{cta}</span>}
          </div>
        </Container>,
      ]}
      animateOnFirstLoadOnly
    />
  );
}
