import React, { useState, useMemo } from "react";
import {
  Button,
  Card,
  Container,
  FileButton,
  Flex,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import { MentionAnalysis } from "./MentionAnalysis.tsx";

interface TweetItem {
  tweet?: {
    created_at: string;
    full_text: string;
    entities?: {
      user_mentions?: { screen_name: string }[];
    };
  };

  created_at?: string;
  full_text?: string;
  entities?: {
    user_mentions?: { screen_name: string }[];
  };
}

interface NormalizedTweet {
  created_at: string;
  full_text: string;
  entities?: {
    user_mentions?: { screen_name: string }[];
  };
}

interface DateRange {
  start: string;
  end: string;
}

export interface AnalysisResult {
  tweetCount: number;
  mentionCount: number;
  ratio: number;
  ranking: { name: string; count: number }[];
}

export const Analyzer: React.FC = () => {
  const [tweets, setTweets] = useState<NormalizedTweet[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    return {
      start: `${now.getFullYear()}-01-01`,
      end: `${now.getFullYear()}-12-31`,
    };
  });

  function handleFileUpload(file: File | null) {
    if (!file) return;

    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;

        // "window.YTD.tweet.part0 = [..."
        const jsonStartIndex = text.indexOf("[");
        if (jsonStartIndex === -1) {
          throw new Error("Invalid tweets.js format");
        }

        const jsonString = text.substring(jsonStartIndex);
        const data: TweetItem[] = JSON.parse(jsonString);

        const normalizedData: NormalizedTweet[] = data.map(
          (item) => (item.tweet || item) as NormalizedTweet
        );
        setTweets(normalizedData);
      } catch (err) {
        setError("Invalid tweets.js format");
        console.error(err);
      }
    };
    reader.readAsText(file);
  }

  const analysis: AnalysisResult | null = useMemo(() => {
    if (!tweets.length) return null;

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    end.setHours(23, 59, 59, 999);

    let tweetCount: number = 0;
    let mentionCount: number = 0;
    const mentionMap = new Map<string, number>();

    const filteredTweets = tweets.filter((t) => {
      const d = new Date(t.created_at);
      if (d < start || d > end) return false;

      if (t.full_text && t.full_text.startsWith("RT @")) return false;

      return true;
    });

    filteredTweets.forEach((t) => {
      tweetCount += 1;

      if (t.entities?.user_mentions) {
        const mentions = t.entities.user_mentions;
        mentionCount += mentions.length;

        mentions.forEach((m) => {
          const screenName = m.screen_name;
          mentionMap.set(screenName, (mentionMap.get(screenName) || 0) + 1);
        });
      }
    });

    const ratio =
      tweetCount === 0 ? 0 : (tweetCount - mentionCount) / tweetCount;

    const ranking = Array.from(mentionMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      tweetCount,
      mentionCount,
      ratio,
      ranking,
    };
  }, [tweets, dateRange]);

  return (
    <Container>
      <Stack>
        <Text component="h1" fz="h1" fw="bold" mt="xl">
          혼잣말 계산기
        </Text>
      </Stack>
      <Stack gap="sm" mt="md">
        <Text c="dark" lh="1">
          <Text
            component="a"
            href="https://help.twitter.com/ko/managing-your-account/how-to-download-your-x-archive"
            rel="noreferer noopener"
            target="_blank"
            c="blue"
            td="underline"
          >
            트위터 아카이브
          </Text>
          의 tweets.js를 업로드하세요.{" "}
          <Text component="a" href="/trustme.jpg" c="blue" td="underline">
            모든 데이터는 브라우저에서만 처리되고, 서버로 절대 보내지 않습니다.
          </Text>
        </Text>
        <FileButton onChange={handleFileUpload}>
          {(props) => (
            <Button {...props} w="fit-content">
              tweet.js 업로드
            </Button>
          )}
        </FileButton>
      </Stack>

      {error && <Text c="red">{error}</Text>}

      {tweets.length > 0 && analysis && (
        <Stack mt="xl">
          <Card withBorder display="block" lh="md">
            <Flex
              gap="xs"
              direction={{
                base: "column",
                md: "row",
              }}
            >
              <Group gap="xs" display="inline-flex">
                <CalendarBlankIcon />
                <DatePickerInput
                  display="inline-flex"
                  valueFormat="YYYY.MM.DD"
                  value={dateRange.start}
                  onChange={(value) => {
                    if (value) {
                      setDateRange((prev) => ({
                        ...prev,
                        start: value,
                      }));
                    }
                  }}
                />
                <Text component="span"> 부터 </Text>
              </Group>

              <Group gap="xs" display="inline-flex">
                <CalendarBlankIcon />
                <DatePickerInput
                  display="inline-flex"
                  valueFormat="YYYY.MM.DD"
                  value={dateRange.start}
                  onChange={(value) => {
                    if (value) {
                      setDateRange((prev) => ({
                        ...prev,
                        end: value,
                      }));
                    }
                  }}
                />
                <Text component="span"> 까지 </Text>
              </Group>
            </Flex>

            <Text component="span" display="inline">
              <Text component="span" fw="bold" fz="h2">
                {analysis.tweetCount.toLocaleString()}
              </Text>
              {` `}개의 트윗 중 멘션은{` `}
              <Text component="span" fw="bold" fz="h2">
                {analysis.mentionCount.toLocaleString()}
              </Text>
              {` `}개로, 혼잣말 비율은{` `}
              <Text component="span" fw="bold" fz="h2">
                {(analysis.ratio * 100).toFixed(2)}%
              </Text>
              {` `}입니다.
            </Text>
          </Card>

          <MentionAnalysis analysis={analysis} />
        </Stack>
      )}
    </Container>
  );
};
