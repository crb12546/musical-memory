import { Badge } from "./badge";
import { ScrollArea } from "./scroll-area";
import type { Resume } from "../../lib/types";

interface ResumePreviewProps {
  resume: Resume;
  onClose: () => void;
}

export function ResumePreview({ resume, onClose }: ResumePreviewProps) {
  const renderParsedContent = () => {
    if (!resume.parsed_content) return null;

    try {
      const content = JSON.parse(resume.parsed_content);
      if (content.error) {
        return (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            <p className="font-medium">处理错误</p>
            <p className="mt-1 text-sm">{content.error}</p>
          </div>
        );
      }

      const sections = [
        { title: "基本信息", key: "basic_info" },
        { title: "工作经验", key: "experience" },
        { title: "教育背景", key: "education" },
        { title: "技能", key: "skills" },
        { title: "项目经历", key: "projects" }
      ];

      return (
        <div className="space-y-6">
          {sections.map(({ title, key }) => {
            const sectionContent = content[key];
            if (!sectionContent) return null;

            return (
              <div key={key} className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {Array.isArray(sectionContent) ? (
                    <ul className="list-disc list-inside space-y-2">
                      {sectionContent.map((item: string, index: number) => (
                        <li key={index} className="text-gray-600">{item}</li>
                      ))}
                    </ul>
                  ) : typeof sectionContent === 'object' ? (
                    <dl className="grid grid-cols-1 gap-2">
                      {Object.entries(sectionContent).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <dt className="font-medium text-gray-700">{key}:</dt>
                          <dd className="text-gray-600">{value as string}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-gray-600">{String(sectionContent)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    } catch (error) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-medium">解析错误</p>
          <p className="mt-1 text-sm">简历内容解析失败</p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {resume.tags.map((tag) => (
          <Badge key={tag.id} variant="secondary">
            {tag.name}
          </Badge>
        ))}
      </div>
      <ScrollArea className="h-[600px] rounded-lg border p-4">
        {renderParsedContent()}
      </ScrollArea>
    </div>
  );
}
