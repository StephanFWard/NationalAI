$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression

$root = Split-Path -Parent $PSScriptRoot
$dataPath = Join-Path $root 'docs\work-log\work-log-data.json'
$outputDirectory = Join-Path $root 'docs\work-log'
$data = Get-Content -Raw -Path $dataPath | ConvertFrom-Json

function ConvertTo-XmlText {
  param([string]$Text)
  return [System.Security.SecurityElement]::Escape($Text)
}

function New-ParagraphXml {
  param(
    [string]$Text,
    [string]$Style = 'Normal'
  )
  $safeText = ConvertTo-XmlText $Text
  return "<w:p><w:pPr><w:pStyle w:val=`"$Style`"/></w:pPr><w:r><w:t xml:space=`"preserve`">$safeText</w:t></w:r></w:p>"
}

function New-Docx {
  param(
    [string]$Path,
    [System.Collections.Generic.List[string]]$Paragraphs
  )

  $documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>$([string]::Join('', $Paragraphs.ToArray()))
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="540" w:footer="540" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

  $stylesXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="20"/></w:rPr><w:pPr><w:spacing w:after="120"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:pPr><w:spacing w:after="240"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:rPr><w:sz w:val="24"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:rPr><w:b/><w:sz w:val="30"/></w:rPr><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="180"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="360"/></w:pPr></w:style>
</w:styles>
'@

  $contentTypesXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>
'@

  $packageRelationshipsXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
'@

  $documentRelationshipsXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
'@

  $fileStream = [System.IO.File]::Open($Path, [System.IO.FileMode]::Create)
  $archive = [System.IO.Compression.ZipArchive]::new($fileStream, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
    $entries = @(
      @{ Name = '[Content_Types].xml'; Content = $contentTypesXml },
      @{ Name = '_rels/.rels'; Content = $packageRelationshipsXml },
      @{ Name = 'word/document.xml'; Content = $documentXml },
      @{ Name = 'word/styles.xml'; Content = $stylesXml },
      @{ Name = 'word/_rels/document.xml.rels'; Content = $documentRelationshipsXml }
    )
    foreach ($entry in $entries) {
      $zipEntry = $archive.CreateEntry($entry.Name, [System.IO.Compression.CompressionLevel]::Optimal)
      $entryStream = $zipEntry.Open()
      $writer = [System.IO.StreamWriter]::new($entryStream, [System.Text.UTF8Encoding]::new($false))
      try {
        $writer.Write($entry.Content)
      }
      finally {
        $writer.Dispose()
      }
    }
  }
  finally {
    $archive.Dispose()
    $fileStream.Dispose()
  }
}

$retrospective = [System.Collections.Generic.List[string]]::new()
$retrospective.Add((New-ParagraphXml '2026 Volunteer IT Work Log' 'Title'))
$retrospective.Add((New-ParagraphXml 'National AI Advancement for Human Innovation | Reconstructed estimate through October 11, 2026' 'Subtitle'))
$retrospective.Add((New-ParagraphXml 'RECORD STATUS: This is a retrospective estimate, not a contemporaneous timecard. Hours follow the founder-reported 20-hour weekly cadence. Weekly work themes are reconstructed and unverified; confirm or correct them against personal records before using this document for formal reporting.' 'Normal'))
$retrospective.Add((New-ParagraphXml $data.retrospective.sourceHistoryNote 'Normal'))
$retrospective.Add((New-ParagraphXml $data.retrospective.openingPartialWeekNote 'Normal'))
$retrospective.Add((New-ParagraphXml 'Estimated year-to-date total: 820 hours across 41 reporting periods: 41 hours website availability checks, 41 hours computer/software updates, and 738 hours IT development/design.' 'Heading1'))
$retrospective.Add((New-ParagraphXml 'Weekly assumed allocation: 1 hour service availability; 1 hour computer/software updates; 5 hours design/planning; 10 hours implementation/configuration; and 3 hours verification/documentation. Each period totals 20 estimated hours.' 'Normal'))
$retrospective.Add((New-ParagraphXml 'The opening January 1-4 period is a partial calendar week but is assigned the full 20-hour weekly estimate solely to follow the stated weekly pattern. Revise it if the actual time differed. The current partial week of October 12 is excluded; this log ends on Sunday, October 11.' 'Normal'))
$retrospective.Add((New-ParagraphXml 'Weekly reconstructed entries' 'Heading1'))
foreach ($week in $data.retrospective.weeks) {
  $weekLabel = 'Week {0:D2}: {1} through {2}{3}' -f [int]$week.week, $week.startDate, $week.endDate, $(if ($week.partialCalendarWeek) { ' (partial opening calendar week)' } else { '' })
  $retrospective.Add((New-ParagraphXml $weekLabel 'Heading2'))
  $retrospective.Add((New-ParagraphXml ('1h availability check; 1h computer/software updates; 5h analysis/design/planning; 10h implementation/configuration; and 3h verification, testing, and documentation, all applied to this estimated weekly focus.') 'Normal'))
  $retrospective.Add((New-ParagraphXml ('Estimated focus: ' + $week.estimatedWorkFocus) 'Normal'))
  $retrospective.Add((New-ParagraphXml ('Status: ' + $week.recordStatus) 'Normal'))
}
$retrospective.Add((New-ParagraphXml 'Evidence and limitations' 'Heading1'))
$retrospective.Add((New-ParagraphXml 'The inspected NationalAI repository history records a static-site rebuild commit on October 2, 2026 and a footer update on October 3, 2026. Those commit records do not substantiate the earlier weekly hours or activity. The founder reports a major migration completed during October 5-11; repository timestamps alone do not independently establish when it completed or how many hours it required.' 'Normal'))
$retrospectivePath = Join-Path $outputDirectory '2026-retrospective-estimate.docx'
New-Docx $retrospectivePath $retrospective

$plan = [System.Collections.Generic.List[string]]::new()
$plan.Add((New-ParagraphXml '480-Hour NationalAI Application Integration Plan' 'Title'))
$plan.Add((New-ParagraphXml 'Dated project work breakdown | October 13, 2026-April 13, 2027' 'Subtitle'))
$plan.Add((New-ParagraphXml 'STATUS: Prospective schedule. Every daily entry is planned work, not a claim that the work has already been performed. Release is conditional on passing tests, acceptance, security/privacy review, deployment rehearsal, and a recorded go/no-go decision.' 'Normal'))
$plan.Add((New-ParagraphXml 'The schedule includes 79 Monday, Tuesday, and Wednesday work dates from October 13, 2026 through April 13, 2027. It assigns three 8-hour workdays and 76 6-hour workdays for exactly 480 project hours. Weekly one-hour website availability checks and one-hour computer/software updates are separate operational overhead and are excluded from these 480 hours.' 'Normal'))
$plan.Add((New-ParagraphXml 'Scope boundary: integrate the production patent-search application capabilities into NationalAI. Do not copy node_modules, credentials, personal/geolocation data, or the entire bundled example collection. Review relevance, license, security, and privacy before migrating any third-party or user data.' 'Normal'))
$plan.Add((New-ParagraphXml 'Work breakdown structure and milestones' 'Heading1'))
foreach ($phase in $data.projectPlan.phases) {
  $plan.Add((New-ParagraphXml ('WBS ' + $phase.id + ' - ' + $phase.name + ' - ' + $phase.estimatedHours + 'h - ' + $phase.startDate + ' to ' + $phase.endDate) 'Heading2'))
  foreach ($activity in $phase.activities) {
    $plan.Add((New-ParagraphXml ($activity.wbs + ': ' + $activity.task + ' Expected evidence/deliverable: ' + $activity.expectedDeliverable) 'ListParagraph'))
  }
}
$plan.Add((New-ParagraphXml 'Dated daily work log (planned)' 'Heading1'))
foreach ($day in $data.projectPlan.dailyEntries) {
  $plan.Add((New-ParagraphXml ($day.date + ' (' + $day.weekday + ') - ' + $day.hours + 'h - WBS ' + $day.wbs + ' - ' + $day.task) 'Heading2'))
  foreach ($item in $day.breakdown) {
    $plan.Add((New-ParagraphXml ($item.wbs + ' | ' + $item.hours + 'h | ' + $item.task) 'Normal'))
  }
  $plan.Add((New-ParagraphXml ('Expected daily evidence/deliverable: ' + $day.expectedDeliverable) 'Normal'))
  $plan.Add((New-ParagraphXml ('Status: ' + $day.status) 'Normal'))
}
$plan.Add((New-ParagraphXml 'Release gates' 'Heading1'))
$plan.Add((New-ParagraphXml 'Before production cutover: all required automated tests pass; existing NationalAI pages and routes remain intact; critical search-to-report user journeys pass acceptance; security and privacy findings are dispositioned with no unresolved critical release blocker; backup/restore and rollback are rehearsed; monitoring and operational ownership are documented; and a dated go/no-go decision is recorded.' 'Normal'))
$planPath = Join-Path $outputDirectory '2026-2027-production-integration-plan.docx'
New-Docx $planPath $plan

Write-Output ("Created {0} ({1} bytes)" -f $retrospectivePath, (Get-Item $retrospectivePath).Length)
Write-Output ("Created {0} ({1} bytes)" -f $planPath, (Get-Item $planPath).Length)
