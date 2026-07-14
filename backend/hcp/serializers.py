from rest_framework import serializers
from .models import HCP, Interaction

class HCPSerializer(serializers.ModelSerializer):
    class Meta:
        model = HCP
        fields = ['id', 'name', 'specialty', 'hospital', 'email', 'phone', 'created_at']

class InteractionSerializer(serializers.ModelSerializer):
    hcp_name = serializers.CharField(source='hcp.name', read_only=True)
    
    class Meta:
        model = Interaction
        fields = [
            'id', 'hcp', 'hcp_name', 'interaction_date', 'type', 
            'summary', 'key_points', 'sentiment', 'next_steps', 
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']