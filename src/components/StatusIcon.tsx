import { BiSolidCheckboxChecked, BiSolidCheckboxMinus, BiSolidXSquare } from 'react-icons/bi';
import Spinner from './Spinner';

export default function StatusIcon({
  type,
  loading,
}: {
  type: 'checked' | 'missing' | 'warning' | 'optional';
  loading?: boolean;
}) {
  const getIcon = () => {
    switch (type) {
      case 'checked':
        return <BiSolidCheckboxChecked size={18} className="text-green-400" />;
      case 'missing':
        return (
          <BiSolidXSquare
            size={14}
            className="translate-x-[2px] translate-y-[1.5px] text-red-400"
          />
        );
      case 'warning':
        return (
          <BiSolidXSquare
            size={14}
            className="translate-x-[2px] translate-y-[1.5px] text-amber-500"
          />
        );
      case 'optional':
        return <BiSolidCheckboxMinus size={18} className="text-dim" />;
    }
  };

  return (
    <div className="min-w-[1.2rem] pt-px">
      {loading ? (
        <div className="translate-y-0.5">
          <Spinner size={14} />
        </div>
      ) : (
        getIcon()
      )}
    </div>
  );
}
