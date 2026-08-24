import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/Badge";
import { ProgressBar } from "@/components/ProgressBar";

// Mock analytics data for MVP
const MOCK_ANALYTICS = {
  totalParents: 12450,
  activeUsers: {
    daily: 3240,
    weekly: 8230,
    monthly: 10200,
  },
  completionRate: 64,
  signBridgeUsers: 840,
  topTopics: [
    { topic: "Positive Discipline", completions: 4520 },
    { topic: "Communication", completions: 3890 },
    { topic: "Emotions", completions: 3210 },
    { topic: "Child Safety", completions: 2850 },
    { topic: "Child Development", completions: 2450 },
  ],
  geographicDistribution: [
    { region: "Douala", users: 4200 },
    { region: "Yaoundé", users: 3800 },
    { region: "Bamenda", users: 2100 },
    { region: "Buea", users: 1450 },
    { region: "Garoua", users: 900 },
  ],
};

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Admin Dashboard
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Programme Monitoring
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: colors.primary + "22" }]}>
              <Icon name="users" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>
              {MOCK_ANALYTICS.totalParents.toLocaleString()}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
              Total Parents
            </Text>
          </Card>
          
          <Card style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: colors.success + "22" }]}>
              <Icon name="activity" size={24} color={colors.success} />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>
              {MOCK_ANALYTICS.activeUsers.daily.toLocaleString()}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
              Daily Active
            </Text>
          </Card>
          
          <Card style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: colors.accent + "22" }]}>
              <Icon name="check-circle" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>
              {MOCK_ANALYTICS.completionRate}%
            </Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
              Completion Rate
            </Text>
          </Card>
          
          <Card style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: colors.care + "22" }]}>
              <Icon name="users" size={24} color={colors.care} />
            </View>
            <Text style={[styles.metricValue, { color: colors.foreground }]}>
              {MOCK_ANALYTICS.signBridgeUsers.toLocaleString()}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
              SignBridge Users
            </Text>
          </Card>
        </View>

        {/* Active Users Chart */}
        <Card style={styles.chartCard}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>
            Active Users
          </Text>
          <View style={styles.chartBars}>
            {[
              { label: "Daily", value: MOCK_ANALYTICS.activeUsers.daily, max: MOCK_ANALYTICS.activeUsers.monthly },
              { label: "Weekly", value: MOCK_ANALYTICS.activeUsers.weekly, max: MOCK_ANALYTICS.activeUsers.monthly },
              { label: "Monthly", value: MOCK_ANALYTICS.activeUsers.monthly, max: MOCK_ANALYTICS.activeUsers.monthly },
            ].map((item) => (
              <View key={item.label} style={styles.chartBarContainer}>
                <Text style={[styles.chartBarLabel, { color: colors.mutedForeground }]}>
                  {item.label}
                </Text>
                <View style={styles.chartBarTrack}>
                  <View
                    style={[
                      styles.chartBarFill,
                      {
                        width: `${(item.value / item.max) * 100}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.chartBarValue, { color: colors.foreground }]}>
                  {item.value.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Top Topics */}
        <Card style={styles.topicsCard}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Most Popular Topics
          </Text>
          <View style={styles.topicsList}>
            {MOCK_ANALYTICS.topTopics.map((topic, index) => (
              <View key={topic.topic} style={styles.topicItem}>
                <View style={styles.topicRank}>
                  <Text style={[styles.topicRankText, { color: colors.primary }]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.topicInfo}>
                  <Text style={[styles.topicName, { color: colors.foreground }]}>
                    {topic.topic}
                  </Text>
                  <ProgressBar
                    progress={topic.completions / MOCK_ANALYTICS.topTopics[0].completions}
                    height={6}
                  />
                </View>
                <Text style={[styles.topicCompletions, { color: colors.mutedForeground }]}>
                  {topic.completions.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Geographic Distribution */}
        <Card style={styles.geoCard}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Geographic Distribution
          </Text>
          <View style={styles.geoList}>
            {MOCK_ANALYTICS.geographicDistribution.map((region) => (
              <View key={region.region} style={styles.geoItem}>
                <Text style={[styles.geoRegion, { color: colors.foreground }]}>
                  {region.region}
                </Text>
                <View style={styles.geoBar}>
                  <ProgressBar
                    progress={region.users / MOCK_ANALYTICS.geographicDistribution[0].users}
                    height={8}
                    color={colors.accent}
                  />
                </View>
                <Text style={[styles.geoUsers, { color: colors.mutedForeground }]}>
                  {region.users.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* SignBridge Usage */}
        <Card style={styles.signbridgeCard}>
          <View style={styles.signbridgeHeader}>
            <View style={[styles.signbridgeBadge, { backgroundColor: colors.care + "22" }]}>
              <Icon name="users" size={20} color={colors.care} />
            </View>
            <Text style={[styles.signbridgeTitle, { color: colors.foreground }]}>
              SignBridge Accessibility
            </Text>
          </View>
          
          <View style={styles.signbridgeStats}>
            <View style={styles.signbridgeStat}>
              <Text style={[styles.signbridgeStatValue, { color: colors.foreground }]}>
                {MOCK_ANALYTICS.signBridgeUsers.toLocaleString()}
              </Text>
              <Text style={[styles.signbridgeStatLabel, { color: colors.mutedForeground }]}>
                SignBridge Users
              </Text>
            </View>
            <View style={styles.signbridgeStat}>
              <Text style={[styles.signbridgeStatValue, { color: colors.foreground }]}>
                {Math.round((MOCK_ANALYTICS.signBridgeUsers / MOCK_ANALYTICS.totalParents) * 100)}%
              </Text>
              <Text style={[styles.signbridgeStatLabel, { color: colors.mutedForeground }]}>
                Adoption Rate
              </Text>
            </View>
          </View>
          
          <ProgressBar
            progress={MOCK_ANALYTICS.signBridgeUsers / MOCK_ANALYTICS.totalParents}
            height={12}
            color={colors.care}
          />
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="download" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.foreground }]}>
                Export Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="users" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.foreground }]}>
                Manage Users
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="settings" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.foreground }]}>
                Settings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Icon name="refresh-cw" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.foreground }]}>
                Refresh Data
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 18,
    marginBottom: 20,
    gap: 12,
  },
  metricCard: {
    width: "48%",
    padding: 16,
    alignItems: "center",
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  chartCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 16,
  },
  chartBars: {
    gap: 16,
  },
  chartBarContainer: {
    gap: 8,
  },
  chartBarLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  chartBarTrack: {
    height: 24,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    overflow: "hidden",
  },
  chartBarFill: {
    height: "100%",
    borderRadius: 12,
  },
  chartBarValue: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
  },
  topicsCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 16,
  },
  topicsList: {
    gap: 16,
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  topicRank: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  topicRankText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
  },
  topicCompletions: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
    minWidth: 60,
    textAlign: "right",
  },
  geoCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 20,
  },
  geoList: {
    gap: 12,
  },
  geoItem: {
    gap: 6,
  },
  geoRegion: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
  geoBar: {
    marginBottom: 4,
  },
  geoUsers: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  signbridgeCard: {
    marginHorizontal: 18,
    marginBottom: 20,
    padding: 20,
  },
  signbridgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  signbridgeBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  signbridgeTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  signbridgeStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  signbridgeStat: {
    alignItems: "center",
  },
  signbridgeStatValue: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  signbridgeStatLabel: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  actionsSection: {
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Inter_500Medium",
  },
});
