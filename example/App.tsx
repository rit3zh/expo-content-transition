import { ContentTransitionAppleView, ContentTransitionAppleComposeView, contentTransitionAppleComposeModifier } from 'expo-content-transition';
import { Host as ComposeHost, Text as ComposeText } from '@expo/ui/jetpack-compose';
import { paddingAll, background as composeBackground } from '@expo/ui/jetpack-compose/modifiers';
import { Column } from '@expo/ui/jetpack-compose';
import { Button, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Module API Example</Text>
        <Group name="Views">
          <ContentTransitionAppleView onTap={() => console.log('Tapped!')} style={styles.view} />
        </Group>
        {process.env.EXPO_OS === 'android' && (
          <Group name="Compose View">
            <ComposeHost style={styles.view}>
              <ContentTransitionAppleComposeView
                title="Hello from ContentTransitionApple"
                modifiers={[paddingAll(16), composeBackground('#f0f0f0')]}>
                <ComposeText>Child content</ComposeText>
              </ContentTransitionAppleComposeView>
            </ComposeHost>
          </Group>
        )}
        {process.env.EXPO_OS === 'android' && (
          <Group name="Compose Modifier">
            <ComposeHost style={styles.view}>
              <Column
                modifiers={[
                  paddingAll(20),
                  contentTransitionAppleComposeModifier({ color: 0xFFFF6B35, width: 3, cornerRadius: 8 }),
                ]}>
                <ComposeText>Custom modifier example</ComposeText>
              </Column>
            </ComposeHost>
          </Group>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: { fontSize: 30, margin: 20 },
  groupHeader: { fontSize: 20, marginBottom: 20 },
  group: { margin: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  container: { flex: 1, backgroundColor: '#eee' },
  view: { flex: 1, height: 200 },
};
