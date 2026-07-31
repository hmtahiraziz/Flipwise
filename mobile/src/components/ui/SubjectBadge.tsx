import {Text, View} from 'react-native';
import {getSubjectColors} from '../../lib/subjectColors';

type SubjectBadgeProps = {
  subject: string;
  size?: 'sm' | 'md';
};

export function SubjectBadge({subject, size = 'md'}: SubjectBadgeProps) {
  const {background, text} = getSubjectColors(subject);
  const isSmall = size === 'sm';

  return (
    <View
      className={`self-start rounded-full ${isSmall ? 'px-2.5 py-0.5' : 'px-3 py-1'}`}
      style={{backgroundColor: background}}>
      <Text
        className={`font-semibold uppercase ${isSmall ? 'text-label-sm' : 'text-label-md'}`}
        style={{color: text}}>
        {subject}
      </Text>
    </View>
  );
}
