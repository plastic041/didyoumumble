import { Card, Table, Text } from "@mantine/core";
import type { AnalysisResult } from "./Analyzer.tsx";

export function MentionAnalysis({ analysis }: { analysis: AnalysisResult }) {
  return (
    <Card withBorder>
      <Text fz="xl" fw="bold" component="h2">
        멘션을 보낸 사용자 순위
      </Text>

      {analysis.ranking.length > 0 ? (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>순위</Table.Th>
              <Table.Th>사용자명</Table.Th>
              <Table.Th>멘션 횟수</Table.Th>
              <Table.Th>비율</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {analysis.ranking.slice(0, 100).map((item, index) => (
              <Table.Tr key={item.name}>
                <Table.Td>#{index + 1}</Table.Td>
                <Table.Td>
                  <Text c="blue">@{item.name}</Text>
                </Table.Td>
                <Table.Td>{item.count}</Table.Td>
                <Table.Td>
                  {analysis.mentionCount > 0
                    ? ((item.count / analysis.mentionCount) * 100).toFixed(1) +
                      "%"
                    : "0.0%"}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <div>기간 내 멘션 없음</div>
      )}
    </Card>
  );
}
