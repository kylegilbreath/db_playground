"use client";

import * as React from "react";

import {
  SmallCard,
  SmallLogoCard,
  type SmallCardItem,
  type SmallLogoCardItem,
} from "@/components/Card";
import { Icon } from "@/components/icons";
import { Section } from "@/components/Section";

type Tile = {
  id: string;
  iconName: string;
  title: string;
  subtitle: string;
  decoratorTagLabel?: string;
};

function toSmallCardItem(t: Tile): SmallCardItem {
  return {
    id: t.id,
    title: {
      leadingIcon: <Icon name={t.iconName} size={16} className="text-text-secondary" />,
      label: t.title,
      decorators: t.decoratorTagLabel
        ? [{ kind: "tag", label: t.decoratorTagLabel, color: "Indigo" }]
        : undefined,
    },
    subtitle: t.subtitle,
    metadataRow: undefined,
  };
}

function TilesGrid({
  tiles,
  columnsClass,
}: {
  tiles: Tile[];
  columnsClass: string;
}) {
  return (
    <div className={`grid w-full grid-cols-1 gap-sm ${columnsClass}`}>
      {tiles.map((t) => (
        <SmallCard key={t.id} item={toSmallCardItem(t)} />
      ))}
    </div>
  );
}

export default function StartSomethingNewPage() {
  const experiments: Tile[] = [
    {
      id: "experiments_genai_apps",
      iconName: "SparkleIcon",
      title: "GenAI apps & agents",
      subtitle: "Build a Generative AI application or agent",
    },
    {
      id: "experiments_fm_finetuning",
      iconName: "modelsIcon",
      title: "Foundation Model Fine-tuning",
      subtitle: "Fine-tune a foundation model",
    },
    {
      id: "experiments_forecasting",
      iconName: "chartLineIcon",
      title: "Forecasting",
      subtitle: "Build a forecasting model using AutoML",
    },
    {
      id: "experiments_classification",
      iconName: "beakerIcon",
      title: "Classification",
      subtitle: "Build a classification model using AutoML",
    },
    {
      id: "experiments_regression",
      iconName: "chartBarIcon",
      title: "Regression",
      subtitle: "Build a regression model using AutoML",
    },
    {
      id: "experiments_custom_training",
      iconName: "codeIcon",
      title: "Custom model training",
      subtitle: "Train a custom classical or DL model",
    },
  ];

  const codingAgents: SmallLogoCardItem[] = [
    {
      id: "coding_agents_cursor",
      mark: { kind: "logo", src: "/logos/Cursor.svg", alt: "Cursor" },
      title: { label: "Cursor", decorators: undefined },
    },
    {
      id: "coding_agents_codex",
      mark: { kind: "logo", src: "/logos/OpenAI.png", alt: "OpenAI" },
      title: { label: "Codex", decorators: undefined },
    },
    {
      id: "coding_agents_gemini",
      mark: { kind: "logo", src: "/logos/Gemini.png", alt: "Gemini" },
      title: { label: "Gemini", decorators: undefined },
    },
    {
      id: "coding_agents_other_integrations",
      mark: { kind: "logo", src: "/logos/Databricks.png", alt: "Databricks" },
      title: { label: "Other integrations", decorators: undefined },
    },
  ];

  const featuredModels: SmallLogoCardItem[] = [
    {
      id: "featured_models_gpt_5_2",
      mark: { kind: "logo", src: "/logos/OpenAI.png", alt: "OpenAI" },
      title: { label: "GPT-5.2", decorators: undefined },
    },
    {
      id: "featured_models_claude_opus_4_6",
      mark: { kind: "logo", src: "/logos/Claude.png", alt: "Claude" },
      title: { label: "Claude Opus 4.6", decorators: undefined },
    },
    {
      id: "featured_models_gemini_3_pro",
      mark: { kind: "logo", src: "/logos/Gemini.png", alt: "Gemini" },
      title: { label: "Gemini 3 Pro", decorators: undefined },
    },
    {
      id: "featured_models_gpt_oss_120b",
      mark: { kind: "logo", src: "/logos/OpenAI.png", alt: "OpenAI" },
      title: { label: "GPT OSS 120B", decorators: undefined },
    },
  ];

  const aiGateway: Tile[] = [
    {
      id: "gateway_fastest_response",
      iconName: "SpeedometerIcon",
      title: "Fastest response",
      subtitle: "Output tokens per second",
    },
    {
      id: "gateway_highest_traffic",
      iconName: "chartBarIcon",
      title: "Highest traffic",
      subtitle: "Total input and output tokens in the last 7 days",
    },
  ];

  const agents: Tile[] = [
    {
      id: "agents_parse",
      iconName: "fileDocumentIcon",
      title: "Parse Document",
      subtitle: "Parse and visualize document structure with AI",
    },
    {
      id: "agents_ie",
      iconName: "clipboardIcon",
      title: "Information Extraction",
      subtitle: "Extract key information into structured JSON",
      decoratorTagLabel: "Beta",
    },
    {
      id: "agents_knowledge_assistant",
      iconName: "questionMarkOutlinedIcon",
      title: "Knowledge Assistant",
      subtitle: "Turn docs into an expert AI chatbot",
    },
    {
      id: "agents_aibi_genie",
      iconName: "SparkleDoubleIcon",
      title: "AI/BI Genie",
      subtitle: "Turn tables into a conversational assistant",
    },
  ];

  const addDataFiles: Tile[] = [
    {
      id: "add_data_create_table",
      iconName: "uploadIcon",
      title: "Create or modify table",
      subtitle: "Upload tabular data files to create a new table or replace an existing one",
    },
    {
      id: "add_data_upload_volume",
      iconName: "folderOutlinedIcon",
      title: "Upload files to a volume",
      subtitle: "Add files in any format to a non-tabular dataset managed in Unity Catalog",
    },
  ];

  const addDataConnectors: Tile[] = [
    { id: "conn_s3", iconName: "cloudIcon", title: "Amazon S3", subtitle: "Databricks connectors" },
    { id: "conn_salesforce", iconName: "cloudUploadIcon", title: "Salesforce", subtitle: "Databricks" },
    { id: "conn_sql_server", iconName: "databaseOutlinedIcon", title: "SQL Server", subtitle: "Databricks" },
    { id: "conn_ga", iconName: "chartLineIcon", title: "Google Analytics Raw Data", subtitle: "Databricks" },
    { id: "conn_sap", iconName: "catalogIcon", title: "SAP Business Data Cloud", subtitle: "Databricks" },
    { id: "conn_workday", iconName: "briefcaseOutlinedIcon", title: "Workday Reports", subtitle: "Databricks" },
    { id: "conn_servicenow", iconName: "gearOutlinedIcon", title: "ServiceNow", subtitle: "Databricks" },
    { id: "conn_zerobus_ingest", iconName: "streamIcon", title: "Zerobus Ingest", subtitle: "Databricks" },
    { id: "conn_zerobus_rest", iconName: "linkIcon", title: "Zerobus Ingest REST", subtitle: "Databricks" },
  ];

  const jobs: Tile[] = [
    {
      id: "jobs_ingestion",
      iconName: "WorkflowCubeIcon",
      title: "Ingestion pipeline",
      subtitle: "Ingest data from apps, databases and files",
    },
    {
      id: "jobs_etl",
      iconName: "WorkflowCodeIcon",
      title: "ETL pipeline",
      subtitle: "Build ETL pipelines using SQL and Python",
    },
    {
      id: "jobs_job",
      iconName: "WorkflowsIcon",
      title: "Job",
      subtitle: "Orchestrate notebooks, pipelines, queries and more",
    },
  ];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[1250px] flex-col gap-lg px-6 pb-8 pt-8">
      <Section title="Start something new (Experiments)">
        <TilesGrid tiles={experiments} columnsClass="sm:grid-cols-2 lg:grid-cols-3" />
      </Section>

      <Section title="Start something new (AI Gateway)">
        <TilesGrid tiles={aiGateway} columnsClass="sm:grid-cols-2 lg:grid-cols-2" />
      </Section>

      <Section
        title="Coding agents"
        description="Manage usage and access for coding agents"
      >
        <div className="grid w-full grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
          {codingAgents.map((item) => (
            <SmallLogoCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      <Section
        title="Featured models"
        description="Frontier models hosted by Databricks"
      >
        <div className="grid w-full grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
          {featuredModels.map((item) => (
            <SmallLogoCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      <Section title="Start something new (Agents)">
        <TilesGrid tiles={agents} columnsClass="sm:grid-cols-2 lg:grid-cols-4" />
      </Section>

      <Section title="Start something new (Add data)">
        <div className="flex w-full flex-col gap-md">
          <TilesGrid tiles={addDataFiles} columnsClass="sm:grid-cols-2" />
          <TilesGrid tiles={addDataConnectors} columnsClass="sm:grid-cols-2 md:grid-cols-3" />
        </div>
      </Section>

      <Section title="Start something new (Jobs & Pipelines)">
        <TilesGrid tiles={jobs} columnsClass="sm:grid-cols-2 lg:grid-cols-3" />
      </Section>
    </main>
  );
}

