import {Text} from 'react-native';

type SectionLabelProps = {
  children: string;
  className?: string;
};

export function SectionLabel({children, className}: SectionLabelProps) {
  return (
    <Text
      className={`text-label font-body-semibold text-muted uppercase mb-3 ${className ?? ''}`}>
      {children}
    </Text>
  );
}
