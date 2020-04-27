import React from "react";
import { Button, PlusIcon, ExpandButton } from "./Button";
import { Field, useField, SelectType, JsonValueInput } from "./Field";
import { Components } from "./types";
import get from "lodash/get";
import { defaultFields, convert, InputField } from "./defaultFields";

const arrayWrap = (val) => `[${val}]`;
const objWrap = (val) => `{${val}}`;

function expandIcon({ expanded, onClick }) {
  return (
    <Button
      onClick={onClick}
      style={{
        marginLeft: -18,
      }}
    >
      <ExpandButton expanded={expanded} />
    </Button>
  );
}

function PlainProperty({ depth, children, name, actions, ...props }) {
  return (
    <div
      className="row"
      style={{
        paddingLeft: 60 + depth * 20,
        display: "flex",
        alignItems: "center",
        position: "relative",
      }}
      {...props}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          alignItems: "center",
          height: "100%",
          display: "flex",
        }}
      >
        {actions}
      </div>
      {name}:{children}
    </div>
  );
}

function TreeRenderer({
  value: initialValue,
  fieldsMap,
  isField,
}: {
  value: any;
  fieldsMap: Map<string, InputField>;
  isField: any;
}) {
  const {
    value,
    list,
    updateField,
    updateKey,
    onDelete: onDeleteItem,
    onConvertType,
    onDuplicate,
    onItemAdd,
    expanded,
    toggleExpanded,
  } = useField(initialValue, fieldsMap, isField);
  return (
    <>
      {list.map((el) => {
        const onActions = (e: any) => {
          const eventName = e.target.value;
          if (eventName === "delete") {
            onDeleteItem(el);
          } else if (eventName.startsWith("convert")) {
            const newType = eventName.split(".")[1];
            onConvertType(el, newType);
          } else if (eventName === "duplicate") {
            onDuplicate(el);
          }
        };
        const onAdd = () => {
          onItemAdd(el);
        };
        const onKeyEdit = (e, v) => {
          updateKey(v, el.key, el.parent);
        };
        const select = (
          <SelectType
            onChange={onActions}
            components={Object.values(fieldsMap)}
          />
        );
        if (el.type === "prop") {
          const isArray = Array.isArray(get(value, el.parent));
          const name = !isArray ? (
            <Field value={el.key || ""} onBlur={onKeyEdit} />
          ) : (
            el.key
          );
          return (
            <PlainProperty
              actions={select}
              key={el.pathKey}
              name={name}
              depth={el.parent.length}
            >
              <JsonValueInput
                value={el.value}
                field={el.field}
                className="value"
                onBlur={(e, v) => {
                  updateField(el.path, () => v);
                }}
              />
            </PlainProperty>
          );
        } else if (el.type === "map" || el.type === "list") {
          return (
            <Group
              field={el}
              onAdd={onAdd}
              onKeyEdit={onKeyEdit}
              menu={select}
              expander={expandIcon({
                expanded: expanded.has(el.pathKey),
                onClick: () => toggleExpanded(el.pathKey),
              })}
            />
          );
        }
        return;
      })}
    </>
  );
}

function Group({
  expander,
  menu,
  field,
  onKeyEdit,
  onAdd,
}: {
  menu: React.ReactNode;
  expander: React.ReactNode;
  field: any;
  onKeyEdit: any;
  onAdd: any;
}) {
  const title =
    field.type === "map"
      ? objWrap(field.childrenLength)
      : arrayWrap(field.childrenLength);
  return (
    <PlainProperty
      actions={menu}
      name={
        <>
          {expander}
          <Field value={field.key || ""} onBlur={onKeyEdit} />
        </>
      }
      depth={field.parent.length}
    >
      <span className="grey">{title}</span>
      <Button onClick={onAdd} title="Add property">
        <PlusIcon />
      </Button>
    </PlainProperty>
  );
}

export function Json({
  value,
  components = defaultFields,
}: {
  value: any;
  components?: Components;
  isField?: any;
}) {
  const { isType, fieldsMap } = convert(components);
  console.log("fieldsMap: ", fieldsMap);
  return (
    <form
      className="json-editor"
      style={{ padding: 20 }}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <TreeRenderer
        value={value as any}
        isField={isType}
        fieldsMap={fieldsMap}
      />
    </form>
  );
}
