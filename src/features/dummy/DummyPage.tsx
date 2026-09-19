import { Box, Text, Title } from '@mantine/core';

interface DummyPageProps {
  title: string;
  description: string;
}

export function DummyPage({ title, description }: DummyPageProps) {
  return (
    <Box maw={960} mx="auto">
      <Text className="page-eyebrow">Secret Browser</Text>
      <Title order={1} size="h2">{title}</Title>
      <Text c="dimmed" mt="xs">{description}</Text>
    </Box>
  );
}
