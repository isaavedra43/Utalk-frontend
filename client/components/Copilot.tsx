import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Copilot() {
  const [isEditing, setIsEditing] = useState(false);
  const [suggestedResponse, setSuggestedResponse] = useState(
    "Perfecto, te puedo ayudar con información detallada sobre nuestros mármoles. ¿Tienes algún color o tipo específico en mente? Contamos con carrara, calacatta, emperador y muchas opciones más.",
  );
  const [editedResponse, setEditedResponse] = useState(suggestedResponse);

  const handleSendAsIs = () => {
    console.log("Sending response as is:", suggestedResponse);
    // Here you would integrate with the chat system
  };

  const handleSendModified = () => {
    console.log("Sending modified response:", editedResponse);
    setSuggestedResponse(editedResponse);
    setIsEditing(false);
    // Here you would integrate with the chat system
  };

  const handleModify = () => {
    setIsEditing(true);
    setEditedResponse(suggestedResponse);
  };

  return (
    <div
      style={{
        borderColor: "rgb(237, 238, 240)",
        color: "rgb(237, 238, 240)",
        display: "flex",
        flexDirection: "column",
        flexFlow: "column nowrap",
        fontSize: "14px",
        height: "100%",
        letterSpacing: "-0.35px",
        outlineColor: "rgb(237, 238, 240)",
        textDecorationColor: "rgb(237, 238, 240)",
        textEmphasisColor: "rgb(237, 238, 240)",
        width: "100%",
        backgroundColor: "rgb(18, 18, 19)",
      }}
    >
      <div
        style={{
          alignItems: "center",
          borderBottom: "1px solid rgb(38, 38, 42)",
          borderBottomWidth: "1px",
          borderColor: "rgb(38, 38, 42)",
          color: "rgb(237, 238, 240)",
          display: "flex",
          fontSize: "14px",
          height: "48px",
          justifyContent: "space-between",
          letterSpacing: "-0.35px",
          outlineColor: "rgb(237, 238, 240)",
          paddingBottom: "8px",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingTop: "8px",
          textDecorationColor: "rgb(237, 238, 240)",
          textEmphasisColor: "rgb(237, 238, 240)",
        }}
      >
        <div
          style={{
            alignItems: "center",
            borderColor: "rgb(237, 238, 240)",
            color: "rgb(237, 238, 240)",
            display: "flex",
            flexBasis: "0%",
            flexGrow: "1",
            fontSize: "14px",
            gap: "8px",
            gridGap: "8px",
            gridRowGap: "8px",
            justifyContent: "space-between",
            letterSpacing: "-0.35px",
            outlineColor: "rgb(237, 238, 240)",
            rowGap: "8px",
            textDecorationColor: "rgb(237, 238, 240)",
            textEmphasisColor: "rgb(237, 238, 240)",
          }}
        >
          <span
            style={{
              borderColor: "rgb(237, 238, 240)",
              color: "rgb(237, 238, 240)",
              fontSize: "14px",
              fontWeight: "500",
              letterSpacing: "-0.35px",
              lineHeight: "20px",
              outlineColor: "rgb(237, 238, 240)",
              textDecorationColor: "rgb(237, 238, 240)",
              textEmphasisColor: "rgb(237, 238, 240)",
            }}
          >
            Copilot
          </span>
          <div
            style={{
              alignItems: "center",
              borderColor: "rgb(237, 238, 240)",
              color: "rgb(237, 238, 240)",
              display: "flex",
              fontSize: "14px",
              letterSpacing: "-0.35px",
              outlineColor: "rgb(237, 238, 240)",
              textDecorationColor: "rgb(237, 238, 240)",
              textEmphasisColor: "rgb(237, 238, 240)",
            }}
          >
            <button
              style={{
                alignItems: "center",
                appearance: "button",
                borderBottomLeftRadius: "8px",
                borderBottomRightRadius: "8px",
                borderBottomStyle: "none",
                borderColor: "rgb(126, 182, 255)",
                borderLeftStyle: "none",
                borderRadius: "8px",
                borderRightStyle: "none",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                borderTopStyle: "none",
                color: "rgb(237, 238, 240)",
                cursor: "pointer",
                display: "flex",
                fontSize: "14px",
                gap: "8px",
                gridGap: "8px",
                gridRowGap: "8px",
                height: "32px",
                justifyContent: "center",
                letterSpacing: "-0.35px",
                lineHeight: "20px",
                outline: "rgba(0, 0, 0, 0) solid 1px",
                outlineColor: "rgba(0, 0, 0, 0)",
                outlineStyle: "solid",
                outlineWidth: "1px",
                rowGap: "8px",
                textAlign: "center",
                textDecorationColor: "rgb(237, 238, 240)",
                textEmphasisColor: "rgb(237, 238, 240)",
                transitionDuration: "0.2s",
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                verticalAlign: "middle",
                width: "32px",
                borderStyle: "none",
                backgroundColor: "rgba(0, 0, 0, 0)",
              }}
            >
              <span
                style={{
                  backgroundColor: "rgb(126, 182, 255)",
                  borderColor: "rgb(237, 238, 240)",
                  color: "rgb(237, 238, 240)",
                  cursor: "pointer",
                  flexShrink: "0",
                  fontSize: "14px",
                  height: "16px",
                  letterSpacing: "-0.35px",
                  lineHeight: "20px",
                  mask: 'url("data:image/svg+xml,%3csvg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\" width=\\"24\\" height=\\"24\\"%3e%3cg fill=\\"none\\" stroke=\\"black\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\"%3e%3cpath d=\\"M21 12a9 9 0 0 0-9-9a9.75 9.75 0 0 0-6.74 2.74L3 8\\"%3e%3c/g%3e%3c/svg%3e") 0% 0% / 100% 100% no-repeat',
                  maskImage:
                    'url("data:image/svg+xml,%3csvg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\" width=\\"24\\" height=\\"24\\"%3e%3cg fill=\\"none\\" stroke=\\"black\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\"%3e%3cpath d=\\"M21 12a9 9 0 0 0-9-9a9.75 9.75 0 0 0-6.74 2.74L3 8\\"%3e%3c/g%3e%3c/svg%3e")',
                  maskRepeat: "no-repeat",
                  maskSize: "100% 100%",
                  outlineColor: "rgb(237, 238, 240)",
                  textAlign: "center",
                  textDecorationColor: "rgb(237, 238, 240)",
                  textEmphasisColor: "rgb(237, 238, 240)",
                  width: "16px",
                }}
              ></span>
            </button>
            <button
              style={{
                alignItems: "center",
                appearance: "button",
                borderBottomLeftRadius: "8px",
                borderBottomRightRadius: "8px",
                borderBottomStyle: "none",
                borderColor: "rgb(126, 182, 255)",
                borderLeftStyle: "none",
                borderRadius: "8px",
                borderRightStyle: "none",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                borderTopStyle: "none",
                color: "rgb(237, 238, 240)",
                cursor: "pointer",
                display: "flex",
                fontSize: "14px",
                gap: "8px",
                gridGap: "8px",
                gridRowGap: "8px",
                height: "32px",
                justifyContent: "center",
                letterSpacing: "-0.35px",
                lineHeight: "20px",
                outline: "rgba(0, 0, 0, 0) solid 1px",
                outlineColor: "rgba(0, 0, 0, 0)",
                outlineStyle: "solid",
                outlineWidth: "1px",
                rowGap: "8px",
                textAlign: "center",
                textDecorationColor: "rgb(237, 238, 240)",
                textEmphasisColor: "rgb(237, 238, 240)",
                transitionDuration: "0.2s",
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                verticalAlign: "middle",
                width: "32px",
                borderStyle: "none",
                backgroundColor: "rgba(0, 0, 0, 0)",
              }}
            >
              <span
                style={{
                  backgroundColor: "rgb(126, 182, 255)",
                  borderColor: "rgb(237, 238, 240)",
                  color: "rgb(237, 238, 240)",
                  cursor: "pointer",
                  flexShrink: "0",
                  fontSize: "14px",
                  height: "16px",
                  letterSpacing: "-0.35px",
                  lineHeight: "20px",
                  mask: 'url("data:image/svg+xml,%3csvg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\" width=\\"24\\" height=\\"24\\"%3e%3cpath fill=\\"none\\" stroke=\\"black\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M18 6L6 18M6 6l12 12\\"%3e%3c/svg%3e") 0% 0% / 100% 100% no-repeat',
                  maskImage:
                    'url("data:image/svg+xml,%3csvg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 24 24\\" width=\\"24\\" height=\\"24\\"%3e%3cpath fill=\\"none\\" stroke=\\"black\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M18 6L6 18M6 6l12 12\\"%3e%3c/svg%3e")',
                  maskRepeat: "no-repeat",
                  maskSize: "100% 100%",
                  outlineColor: "rgb(237, 238, 240)",
                  textAlign: "center",
                  textDecorationColor: "rgb(237, 238, 240)",
                  textEmphasisColor: "rgb(237, 238, 240)",
                  width: "16px",
                }}
              ></span>
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          alignItems: "flex-start",
          borderColor: "rgb(237, 238, 240)",
          color: "rgb(237, 238, 240)",
          display: "flex",
          flexBasis: "0%",
          flexGrow: "1",
          flexDirection: "column",
          fontSize: "14px",
          letterSpacing: "-0.35px",
          outlineColor: "rgb(237, 238, 240)",
          overflowX: "auto",
          overflowY: "auto",
          paddingBottom: "16px",
          paddingLeft: "16px",
          paddingRight: "16px",
          paddingTop: "16px",
          textDecorationColor: "rgb(237, 238, 240)",
          textEmphasisColor: "rgb(237, 238, 240)",
        }}
      >
        {/* AI Suggested Response Section */}
        <div
          style={{
            borderColor: "rgb(237, 238, 240)",
            color: "rgb(237, 238, 240)",
            fontSize: "14px",
            letterSpacing: "-0.35px",
            outlineColor: "rgb(237, 238, 240)",
            textDecorationColor: "rgb(237, 238, 240)",
            textEmphasisColor: "rgb(237, 238, 240)",
            width: "100%",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              borderColor: "rgb(237, 238, 240)",
              color: "rgb(126, 182, 255)",
              fontSize: "12px",
              fontWeight: "500",
              letterSpacing: "-0.35px",
              outlineColor: "rgb(237, 238, 240)",
              textDecorationColor: "rgb(237, 238, 240)",
              textEmphasisColor: "rgb(237, 238, 240)",
              marginBottom: "8px",
            }}
          >
            🤖 Respuesta Sugerida por IA
          </div>

          {/* Suggested Response Bubble */}
          <div
            style={{
              backgroundColor: "rgba(126, 182, 255, 0.1)",
              border: "1px solid rgba(126, 182, 255, 0.3)",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                borderColor: "rgb(237, 238, 240)",
                color: "rgb(237, 238, 240)",
                fontSize: "14px",
                letterSpacing: "-0.35px",
                lineHeight: "20px",
                outlineColor: "rgb(237, 238, 240)",
                overflowWrap: "break-word",
                textDecorationColor: "rgb(237, 238, 240)",
                textEmphasisColor: "rgb(237, 238, 240)",
                wordWrap: "break-word",
              }}
            >
              {suggestedResponse}
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div style={{ marginBottom: "12px" }}>
              <Textarea
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
                className="w-full bg-gray-800 border-gray-600 text-white text-sm mb-3"
                rows={4}
                style={{
                  backgroundColor: "rgba(36, 38, 45, 0.9)",
                  border: "1px solid rgb(38, 38, 42)",
                  borderRadius: "8px",
                  color: "rgb(237, 238, 240)",
                  fontSize: "14px",
                  padding: "12px",
                  resize: "vertical",
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            {!isEditing ? (
              <>
                <Button
                  onClick={handleSendAsIs}
                  style={{
                    backgroundColor: "rgb(34, 197, 94)",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "12px",
                    padding: "6px 12px",
                  }}
                >
                  ✉️ Enviar tal cual
                </Button>
                <Button
                  onClick={handleModify}
                  style={{
                    backgroundColor: "rgba(126, 182, 255, 0.2)",
                    border: "1px solid rgb(126, 182, 255)",
                    borderRadius: "6px",
                    color: "rgb(126, 182, 255)",
                    cursor: "pointer",
                    fontSize: "12px",
                    padding: "6px 12px",
                  }}
                >
                  ✏️ Modificar
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSendModified}
                  style={{
                    backgroundColor: "rgb(34, 197, 94)",
                    border: "none",
                    borderRadius: "6px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "12px",
                    padding: "6px 12px",
                  }}
                >
                  ✉️ Enviar modificado
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  style={{
                    backgroundColor: "rgba(107, 114, 128, 0.2)",
                    border: "1px solid rgb(107, 114, 128)",
                    borderRadius: "6px",
                    color: "rgb(156, 163, 175)",
                    cursor: "pointer",
                    fontSize: "12px",
                    padding: "6px 12px",
                  }}
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Original Content */}
        <div
          style={{
            borderColor: "rgb(237, 238, 240)",
            color: "rgb(237, 238, 240)",
            display: "flex",
            flexBasis: "0%",
            flexDirection: "column",
            flexFlow: "column nowrap",
            flexGrow: "1",
            fontSize: "14px",
            letterSpacing: "-0.35px",
            outlineColor: "rgb(237, 238, 240)",
            textDecorationColor: "rgb(237, 238, 240)",
            textEmphasisColor: "rgb(237, 238, 240)",
            width: "100%",
          }}
        >
          {/* AI Functions */}
          <div
            style={{
              borderColor: "rgb(237, 238, 240)",
              color: "rgb(237, 238, 240)",
              display: "flex",
              flexDirection: "column",
              flexFlow: "column nowrap",
              fontSize: "14px",
              gap: "8px",
              gridGap: "8px",
              gridRowGap: "8px",
              letterSpacing: "-0.35px",
              marginBottom: "20px",
              outlineColor: "rgb(237, 238, 240)",
              rowGap: "8px",
              textDecorationColor: "rgb(237, 238, 240)",
              textEmphasisColor: "rgb(237, 238, 240)",
            }}
          >
            <button
              style={{
                alignItems: "center",
                appearance: "button",
                backgroundColor: "rgba(0, 0, 0, 0)",
                border: "1px solid rgb(119, 123, 132)",
                borderRadius: "8px",
                color: "rgb(237, 238, 240)",
                cursor: "pointer",
                display: "flex",
                fontSize: "12px",
                gap: "8px",
                letterSpacing: "-0.35px",
                lineHeight: "16px",
                padding: "8px 12px",
                textAlign: "left",
                transitionDuration: "0.2s",
                width: "100%",
              }}
            >
              📄 Summarize this conversation
            </button>

            <button
              style={{
                alignItems: "center",
                appearance: "button",
                backgroundColor: "rgba(0, 0, 0, 0)",
                border: "1px solid rgb(119, 123, 132)",
                borderRadius: "8px",
                color: "rgb(237, 238, 240)",
                cursor: "pointer",
                display: "flex",
                fontSize: "12px",
                gap: "8px",
                letterSpacing: "-0.35px",
                lineHeight: "16px",
                padding: "8px 12px",
                textAlign: "left",
                transitionDuration: "0.2s",
                width: "100%",
              }}
            >
              💡 Suggest an answer
            </button>

            <button
              style={{
                alignItems: "center",
                appearance: "button",
                backgroundColor: "rgba(0, 0, 0, 0)",
                border: "1px solid rgb(119, 123, 132)",
                borderRadius: "8px",
                color: "rgb(237, 238, 240)",
                cursor: "pointer",
                display: "flex",
                fontSize: "12px",
                gap: "8px",
                letterSpacing: "-0.35px",
                lineHeight: "16px",
                padding: "8px 12px",
                textAlign: "left",
                transitionDuration: "0.2s",
                width: "100%",
              }}
            >
              ⭐ Rate this conversation
            </button>
          </div>

          <div
            style={{
              borderColor: "rgb(237, 238, 240)",
              color: "rgb(237, 238, 240)",
              display: "flex",
              flexDirection: "column",
              flexFlow: "column nowrap",
              fontSize: "14px",
              gap: "4px",
              gridGap: "4px",
              gridRowGap: "4px",
              letterSpacing: "-0.35px",
              marginTop: "24px",
              outlineColor: "rgb(237, 238, 240)",
              rowGap: "4px",
              textDecorationColor: "rgb(237, 238, 240)",
              textEmphasisColor: "rgb(237, 238, 240)",
            }}
          >
            <div
              style={{
                borderColor: "rgb(237, 238, 240)",
                color: "rgb(237, 238, 240)",
                fontSize: "14px",
                fontWeight: "500",
                letterSpacing: "-0.35px",
                outlineColor: "rgb(237, 238, 240)",
                textDecorationColor: "rgb(237, 238, 240)",
                textEmphasisColor: "rgb(237, 238, 240)",
              }}
            >
              Captain
            </div>
            <div
              style={{
                borderColor: "rgb(237, 238, 240)",
                color: "rgb(237, 238, 240)",
                fontSize: "14px",
                letterSpacing: "-0.35px",
                outlineColor: "rgb(237, 238, 240)",
                overflowWrap: "break-word",
                textDecorationColor: "rgb(237, 238, 240)",
                textEmphasisColor: "rgb(237, 238, 240)",
                wordWrap: "break-word",
              }}
            >
              <p
                style={{
                  borderColor: "rgb(237, 238, 240)",
                  color: "rgb(237, 238, 240)",
                  fontSize: "14px",
                  letterSpacing: "-0.35px",
                  lineHeight: "23.1px",
                  outlineColor: "rgb(237, 238, 240)",
                  overflowWrap: "break-word",
                  textDecorationColor: "rgb(237, 238, 240)",
                  textEmphasisColor: "rgb(237, 238, 240)",
                  wordWrap: "break-word",
                }}
              >
                The customer asked about how to make a purchase, the
                availability of a color catalog, and pricing. The support agent
                responded by directing the customer to their WhatsApp for more
                detailed inquiries and provided information about the variety of
                finishes available, such as marble and granite.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          borderColor: "rgb(237, 238, 240)",
          color: "rgb(237, 238, 240)",
          fontSize: "14px",
          letterSpacing: "-0.35px",
          marginBottom: "8px",
          marginLeft: "12px",
          marginRight: "12px",
          marginTop: "1px",
          outlineColor: "rgb(237, 238, 240)",
          textDecorationColor: "rgb(237, 238, 240)",
          textEmphasisColor: "rgb(237, 238, 240)",
        }}
      >
        <form
          style={{
            borderColor: "rgb(237, 238, 240)",
            color: "rgb(237, 238, 240)",
            fontSize: "14px",
            letterSpacing: "-0.35px",
            marginBottom: "4px",
            outlineColor: "rgb(237, 238, 240)",
            position: "relative",
            textDecorationColor: "rgb(237, 238, 240)",
            textEmphasisColor: "rgb(237, 238, 240)",
            width: "100%",
          }}
        >
          <input
            type="text"
            placeholder="Send message..."
            style={{
              appearance: "auto",
              backgroundColor: "rgba(36, 38, 45, 0.9)",
              border: "1px solid rgb(38, 38, 42)",
              borderRadius: "8px",
              color: "rgb(176, 180, 186)",
              cursor: "text",
              display: "inline-block",
              fontSize: "14px",
              letterSpacing: "-0.35px",
              lineHeight: "20px",
              outlineColor: "rgb(237, 238, 240)",
              overflowX: "clip",
              overflowY: "clip",
              paddingBottom: "12px",
              paddingLeft: "16px",
              paddingRight: "48px",
              paddingTop: "12px",
              textDecorationColor: "rgb(237, 238, 240)",
              textEmphasisColor: "rgb(237, 238, 240)",
              width: "100%",
            }}
          />
          <button
            type="submit"
            style={{
              alignItems: "center",
              appearance: "button",
              backgroundColor: "rgba(0, 0, 0, 0)",
              border: "none",
              borderRadius: "8px",
              color: "rgb(176, 180, 186)",
              cursor: "pointer",
              display: "flex",
              fontSize: "14px",
              height: "36px",
              justifyContent: "center",
              letterSpacing: "-0.35px",
              lineHeight: "20px",
              outlineColor: "rgb(237, 238, 240)",
              padding: "4px 10px",
              position: "absolute",
              right: "6px",
              textAlign: "center",
              textDecorationColor: "rgb(237, 238, 240)",
              textEmphasisColor: "rgb(237, 238, 240)",
              top: "50%",
              transitionDuration: "0.2s",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              verticalAlign: "middle",
              width: "40px",
              transform: "matrix(1, 0, 0, 1, 0, -18)",
            }}
          >
            <i
              style={{
                backgroundColor: "rgb(176, 180, 186)",
                borderColor: "rgb(237, 238, 240)",
                color: "rgba(255, 255, 255, 1)",
                cursor: "pointer",
                fontSize: "14px",
                fontStyle: "italic",
                height: "16px",
                letterSpacing: "-0.35px",
                lineHeight: "20px",
                mask: 'url("data:image/svg+xml,%3csvg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 256 256\\" width=\\"256\\" height=\\"256\\"%3e%3cpath fill=\\"black\\" d=\\"M205.66 117.66a8 8 0 0 1-11.32 0L136 59.31V216a8 8 0 0 1-16 0V59.31l-58.34 58.35a8 8 0 0 1-11.32-11.32l72-72a8 8 0 0 1 11.32 0l72 72a8 8 0 0 1 0 11.32\\"%3e%3c/svg%3e") 0% 0% / 100% 100% no-repeat',
                maskImage:
                  'url("data:image/svg+xml,%3csvg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 256 256\\" width=\\"256\\" height=\\"256\\"%3e%3cpath fill=\\"black\\" d=\\"M205.66 117.66a8 8 0 0 1-11.32 0L136 59.31V216a8 8 0 0 1-16 0V59.31l-58.34 58.35a8 8 0 0 1-11.32-11.32l72-72a8 8 0 0 1 11.32 0l72 72a8 8 0 0 1 0 11.32\\"%3e%3c/svg%3e")',
                maskRepeat: "no-repeat",
                maskSize: "100% 100%",
                outlineColor: "rgb(237, 238, 240)",
                textAlign: "center",
                textDecorationColor: "rgb(237, 238, 240)",
                textEmphasisColor: "rgb(237, 238, 240)",
                width: "16px",
              }}
            ></i>
          </button>
        </form>
      </div>
    </div>
  );
}
