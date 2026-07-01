from dataclasses import dataclass
from typing import Optional


@dataclass
class Participante:
    """Time/participante que pode ser mandante ou visitante de um evento."""

    id: int
    nome: str
    escudo_url: Optional[str]
    esporte: str = "Futebol"
    ativo: bool = True