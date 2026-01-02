import React, { useState, useCallback } from 'react';
import '../styles/DataInput.css';

interface DataInputProps {
  onDataChange: (values: number[]) => void;
  currentData: number[];
  dataType?: 'linked-list' | 'cycle-list';
}

// 预设数据样例
const PRESETS = {
  'linked-list': [
    { label: '示例1', values: [1, 2, 3, 4, 5] },
    { label: '示例2', values: [1, 2] },
    { label: '单节点', values: [1] },
    { label: '长链表', values: [1, 2, 3, 4, 5, 6, 7, 8] },
  ],
  'cycle-list': [
    { label: '有环', values: [3, 2, 0, -4], cyclePos: 1 },
    { label: '无环', values: [1, 2, 3, 4, 5], cyclePos: -1 },
    { label: '单节点环', values: [1], cyclePos: 0 },
    { label: '双节点环', values: [1, 2], cyclePos: 0 },
  ],
};

const DataInput: React.FC<DataInputProps> = ({ 
  onDataChange, 
  currentData,
  dataType = 'linked-list'
}) => {
  const [inputValue, setInputValue] = useState(currentData.join(', '));
  const [error, setError] = useState<string | null>(null);

  // 验证输入数据
  const validateInput = useCallback((input: string): number[] | null => {
    if (!input.trim()) {
      setError('请输入数据');
      return null;
    }

    // 支持多种分隔符：逗号、空格、中文逗号
    const parts = input.split(/[,，\s]+/).filter(s => s.trim());
    const values: number[] = [];

    for (const part of parts) {
      const num = parseInt(part.trim(), 10);
      if (isNaN(num)) {
        setError(`"${part}" 不是有效的数字`);
        return null;
      }
      if (num < -100 || num > 100) {
        setError('数值范围应在 -100 到 100 之间');
        return null;
      }
      values.push(num);
    }

    if (values.length === 0) {
      setError('请至少输入一个数字');
      return null;
    }

    if (values.length > 10) {
      setError('最多支持 10 个节点');
      return null;
    }

    setError(null);
    return values;
  }, []);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError(null);
  };

  // 处理确认
  const handleConfirm = () => {
    const values = validateInput(inputValue);
    if (values) {
      onDataChange(values);
    }
  };

  // 处理回车键
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  // 选择预设数据
  const handlePresetClick = (values: number[]) => {
    setInputValue(values.join(', '));
    setError(null);
    onDataChange(values);
  };

  // 随机生成数据
  const handleRandom = () => {
    const length = Math.floor(Math.random() * 6) + 3; // 3-8 个节点
    const values: number[] = [];
    for (let i = 0; i < length; i++) {
      values.push(Math.floor(Math.random() * 20) - 5); // -5 到 14
    }
    setInputValue(values.join(', '));
    setError(null);
    onDataChange(values);
  };

  const presets = PRESETS[dataType];

  return (
    <div className="data-input-container">
      <div className="data-input-row">
        <span className="input-label">输入数据:</span>
        <input
          type="text"
          className={`data-input ${error ? 'error' : ''}`}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="输入数字，用逗号分隔，如: 1, 2, 3, 4, 5"
        />
        <button className="confirm-btn" onClick={handleConfirm}>
          确认
        </button>
        <button className="random-btn" onClick={handleRandom}>
          🎲 随机
        </button>
        <div className="presets">
          {presets.map((preset, index) => (
            <button
              key={index}
              className="preset-btn"
              onClick={() => handlePresetClick(preset.values)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default DataInput;
