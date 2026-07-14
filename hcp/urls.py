from django.urls import path
from . import views

urlpatterns = [
    # Chat
    path('api/chat', views.chat, name='chat'),
    
    # Interactions
    path('api/interactions/log', views.log_interaction_endpoint, name='log_interaction'),
    path('api/interactions/edit', views.edit_interaction_endpoint, name='edit_interaction'),
    
    # HCPs
    path('api/hcps', views.list_hcps, name='list_hcps'),
    path('api/hcps/search', views.search_hcp_endpoint, name='search_hcp'),
    path('api/hcps/<int:hcp_id>/history', views.get_hcp_history_endpoint, name='hcp_history'),
    path('api/hcps/<int:hcp_id>/suggest', views.suggest_next_steps_endpoint, name='suggest_next_steps'),
    path('api/hcps/follow-up', views.generate_follow_up_endpoint, name='generate_follow_up'),
]